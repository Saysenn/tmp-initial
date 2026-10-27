# Architecture Rules

## Stack
Check `package.json` first and follow the matching section in @folder-structure.md:
- **Next.js** (`next` in dependencies): one app, frontend and backend together under `src/`.
- **React + Node (Express)** (a `client/` React app and a `server/` Express app): two packages plus `shared/`, in npm workspaces.

The rules below apply to both stacks.

## Rules
1. Strictly a modular monolith. Each feature owns its business logic (`service.js`), data access (`repository.js`), and UI. Features use each other only through `service.js` or `repository.js`, never by importing another feature's components or helpers. Feature folders by stack:
   - Next.js: `src/features/<feature>/`
   - React + Node: `server/src/modules/<module>/` for the backend, `client/src/features/<feature>/` for the frontend
2. Plain JavaScript only (`.js` / `.jsx`). No TypeScript, no `.ts` / `.tsx` files. Use JSDoc comments where types help.
3. Centralize configs. Every setting and list lives in a `configs/` folder, one file per area (billing, plans, email, bot, navigation, and so on). Next.js has one `src/configs/`; React + Node has `client/src/configs/` and `server/src/configs/`. Site-wide settings (name, URL, support email) live in `site.js`. Site modes ("live", "beta", "maintenance", "repairing", "coming_soon") and the pages each mode allows live in `site-status.js`; the active mode is set from the admin console and stored in the database.
4. No hardcoded values or data. Text, URLs, colors, limits, dropdown options, and API endpoints come from config, constants, environment variables, or the database. Secrets live only in server environment variables and are never committed or sent to the browser.
5. Use proper design patterns for complex features so implementations can be swapped easily (see below).

## Data Integrity (ACID)
- **Atomic:** a write that touches more than one row or table runs in one transaction. Either all of it saves or none of it does.
- **Consistent:** the database enforces the rules too, not just the app: foreign keys, `not null`, `unique`, and `check` constraints.
- **Isolated:** never read a value, change it in code, and write it back. Update balances, counters, and stock in one statement (`set credits = credits - 1 where credits >= 1`) or lock the row first (`select ... for update`).
- **Durable:** report success to the user only after the transaction commits. Emails, webhooks, and other outside calls run after the commit, never inside the transaction.

## Idempotency
Any request that could arrive twice (double clicks, retries, webhooks, crons) must have the same effect the second time as the first. Required for payments, credits, orders, and anything that sends money or messages.
- **Outgoing payment calls** always send an idempotency key (e.g. Stripe's `Idempotency-Key`), built from our own record id so a retry reuses it.
- **Incoming webhooks** store the provider's event id under a `unique` constraint and skip any event already processed.
- **Client writes** for payments and orders send an `Idempotency-Key` header. The server stores the key with its result and returns the stored result on a repeat.
- **Jobs and crons** can run twice without doubling their effect.
- **Buttons** that submit are disabled while the request is pending.

## Throttling and Debouncing
- **Debounce** input that fires on every keystroke or change: search boxes, autosave, live validation, and filters.
- **Throttle** events that fire continuously: scroll, resize, pointer move, and polling.
- **Rate limit on the server** for sign-in, sign-up, password reset, public forms, and costly endpoints (AI, email, payments). Count limits in a shared store (database or Redis), not in memory, so they hold across server instances. Return `429` with a `Retry-After` header.
- All delays, intervals, and limits come from config, never hardcoded.

## Caching
- **What to cache:** reads that happen often and change rarely (settings, plans, lists, public pages, dashboards). Never cache secrets, and never put one user's data in a cache another user can read.
- **Layers:**
  - Browser: Next.js router cache or TanStack Query, with keys and stale times from `configs/query.js` or the cache config.
  - Server: `lib/cache.js` (Next.js data cache or Redis) for shared reads.
  - CDN: `Cache-Control` headers (or Next.js revalidate) for public pages and static files.
- **Keys:** built in one place from config, and always include the tenant or user they belong to. Prefer versioned keys (bump a version on write) so old entries are never read again.
- **Expiry:** every cached value has a lifetime set in config, never hardcoded.
- **Invalidate on every write:** after the transaction commits, clear or refresh every affected key (`revalidateTag` / `revalidatePath`, `invalidateQueries`, or deleting the Redis key). Stale data must never be shown after a change.
- **Never cache errors or partial results.** If the cache is down, fall back to the database instead of failing.
- **One request per key:** when several callers ask for the same uncached value at once, share one in-flight request.

## Queueing
- **Queue slow or unreliable work** instead of doing it inside the request: emails, notifications, AI tasks, file exports, webhook processing, and syncs with outside services. The request saves the data, queues the job, and responds right away.
- **Enqueue after commit:** write the job to an `outbox` table in the same transaction as the data, and a worker moves it to the queue. A job is never lost because the app crashed between saving and queueing.
- **Jobs are idempotent** (see Idempotency) because every job may run more than once.
- **Retries:** failed jobs retry with growing delays (backoff) up to a limit from config. Jobs that still fail go to a dead letter list that admins can view and retry.
- **Each feature lists its jobs** in its own `jobs.js` (job name, handler, retry settings).
- **The queue sits behind an adapter** (`lib/queue/`), so the tool can be swapped: pg-boss on Postgres, BullMQ on Redis, or a hosted queue.

## Design Patterns
Whenever a feature has interchangeable providers or behaviors, define one shared interface, put each implementation behind it, and pick the active one from config. Feature code calls the interface, never a specific provider, so switching is a config change rather than a rewrite.

- **Payments: Strategy pattern.** One strategy per provider (e.g. Stripe, PayPal), each exposing the same methods (`createPayment`, `refund`, `verifyWebhook`). The active provider is selected in the payments config.
- **Notifications: Strategy plus Observer.** One strategy per channel (email, SMS, push, in-app) behind a shared `send` method. Features emit events (e.g. `order.created`) through the server's event bus (`lib/events.js`), and the notifications feature subscribes and decides which channels to use. Features never call a channel directly.
- **Toasts: one Toaster plus a wrapper.** A single `<Toaster />` at the app root. Features call a shared wrapper in the frontend `lib/toast.js` (`success`, `error`, `info`), never the toast library directly, so the library can be swapped. No component renders its own toast markup. Variants, durations, and positions come from config.
- **Third-party services in general: Adapter pattern.** Wrap every external SDK (storage, email, analytics, maps) in an adapter so the rest of the code never imports the SDK directly.
- **Choosing an implementation: Factory.** A small factory reads the config and returns the right strategy or adapter, so the selection logic lives in one place.
- **Data access: Repository pattern.** Every database read and write goes through the feature's `repository.js`. Services never write queries, and repositories hold no business rules. Swapping the database or ORM only touches repositories.
- **Shared clients: Singleton.** The database pool, Redis client, queue client, query client, and SDK clients are created once per process and reused. In Next.js development, keep them on `globalThis` so hot reload doesn't open new connections. Singletons hold connections and config only, never per-user or per-request state.
- **Complex objects: Builder.** Use a builder when an object has many optional parts: report and export queries, checkout or invoice payloads, email messages, and search filters. Simple objects stay plain object literals.
- **Cross-cutting concerns: Decorator.** Auth, input validation, rate limits, logging, caching, and retries wrap a function instead of living inside it (`tenantAction(schema, handler)`, `withCache(fn)`, `withRetry(fn)`, Express middleware). Business logic stays free of plumbing.
- **Reads and writes: CQRS (light).** Inside each feature, keep reads (queries that return data, safe to cache) separate from writes (commands that change data, run in transactions, invalidate caches). Heavy dashboards and reports may read from database views or summary tables. No event sourcing or separate databases unless a project truly needs it.
- **Outside services: Circuit Breaker.** Every call to an outside service (payments, email, AI, maps) goes through its adapter with a timeout. After repeated failures within a window, the breaker opens and calls fail fast with a fallback or a clear error until a cooldown passes, then a test call decides whether to close it. Thresholds, windows, and cooldowns come from config.

## API Versioning
Every HTTP route lives under a version folder (`/api/v1/...`) and is listed in `configs/api.js`. A breaking change (renamed field, removed route, different response shape) goes in a new folder (`/api/v2/`) while `v1` keeps working until every caller has moved. Never edit `v1` in place. Adding an optional field is not a breaking change. See @folder-structure.md.
