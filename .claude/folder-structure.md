# Folder Structure

Two supported stacks. Check `package.json` and follow the matching section:
- **Next.js:** `next` in dependencies. One app, frontend and backend together under `src/`.
- **React + Node (Express):** a `client/` React app (Vite) and a `server/` Express app, plus `shared/`, in npm workspaces.

Both are modular monoliths in plain JavaScript (`.js` / `.jsx`) with Tailwind CSS, zod, and sonner.

## Shared Rules (Both Stacks)

1. Pages stay thin: routing, layout, and metadata only. Logic lives in features.
2. A component used by two or more features moves to the shared `components/` folder. A helper used by two or more features moves to `lib/`.
3. No global `services/` folder. Business logic lives in each feature's `service.js`. When one grows too large, split it inside the feature (`<feature>/services/*.js`). Shared services that belong to no feature (email sending, location lookup) go in `lib/`.
4. Third-party SDKs are imported only inside `lib/` adapters or a feature's `providers/` or `strategies/` folder.
5. Only `configs/env.js` reads environment variables. Everything else imports from it.
6. Each page's hero styles live in a CSS file next to that page, not in the global stylesheet.
7. Every API route is listed in `configs/api.js`, and the browser calls it only through `api` in `lib/api/client.js`. Never write an `"/api/..."` string anywhere else. Routes are versioned (`/api/v1`); a breaking change gets `v2`, never an edit to `v1` in place.
8. Multi-step writes are one database transaction. Outside services (Stripe, calendar, email) run after it succeeds.
9. File naming: kebab-case for every file (`sign-in-form.jsx`, `use-board.js`, `site-status.js`).
10. Every project has a root `scripts/` folder, and every repeatable task (database migration, seeding, provider setup) is a script there with an npm command in the root `package.json`. Nobody should need to copy SQL into a dashboard or remember a long command. See Scripts below.

## Scripts (Both Stacks)

Every project ships with at least these npm commands:

| Command                | Script                     | What it does                                                   |
| ---------------------- | -------------------------- | -------------------------------------------------------------- |
| `npm run migrate`      | `scripts/migrate.mjs`      | Brings the database schema up to date                          |
| `npm run db:seed`      | `scripts/seed.mjs`         | Loads sample data into a local database                        |
| `npm run db:reset`     | `scripts/reset.mjs`        | Drops and rebuilds the local database, then migrates and seeds |
| `npm run <tool>:setup` | `scripts/<tool>-setup.mjs` | Creates provider records from config (e.g. Stripe products)    |

Rules for `npm run migrate`:
1. It reads the connection string from env (through `configs/env.js` or `.env`), never from a value written in the script.
2. It is safe to run again and again: running it twice changes nothing the second time.
3. It prints which database it is about to change and what it applied, and exits with an error code when anything fails.
4. Against a hosted or production database it asks for confirmation (or needs a `--yes` flag). `db:reset` refuses to run against anything but a local database.
5. Claude never runs `migrate` against a hosted database unless the user asks for it in that conversation.

Where the schema lives:
- **Next.js (Supabase):** `migrate` applies `supabase/schema.sql`, which is written to be rerun (`if not exists`, `create or replace`), then any new files in `supabase/patches/`.
- **React + Node:** `migrate` runs the numbered files in `server/src/db/migrations/` in order, inside a transaction each, and records applied ones in a `schema_migrations` table so each runs only once.

================================================================================

## Next.js Stack

Next.js (App Router), React, Supabase (Postgres, auth, row level security), Stripe.

```
/
├── src/
│   ├── app/                              # Routes only. Pages stay thin and render feature components.
│   │   ├── layout.jsx                    # Root layout: fonts, providers, toaster, analytics
│   │   ├── globals.css                   # Tailwind and design tokens only (hero styles stay per page)
│   │   ├── not-found.jsx, global-error.jsx
│   │   ├── sitemap.js, robots.js, manifest.js, opengraph-image.jsx
│   │   ├── (site)/                       # Public marketing pages (about, pricing, features, contact)
│   │   ├── (auth)/                       # Sign in, sign up, forgot and reset password, MFA
│   │   ├── (app)/                        # Signed-in app (dashboard, settings/<section>, feature pages)
│   │   ├── admin/                        # Platform admin console
│   │   ├── auth/                         # Auth callbacks (callback, confirm, signout)
│   │   ├── legal/                        # privacy, terms, cookies
│   │   ├── coming-soon/, unavailable/    # Pages for the non-live site modes
│   │   └── api/v1/                       # HTTP routes, only for things that need a URL (see Data Flow)
│   │       ├── stripe/webhook/route.js
│   │       ├── cron/<job>/route.js
│   │       └── <feature>/<action>/route.js
│   │
│   ├── features/                         # One self-contained module per feature
│   │   └── <feature>/
│   │       ├── actions.js                # "use server": zod schema, action wrapper, one service call, refresh
│   │       ├── service.js                # import "server-only": business logic as fn(ctx, input)
│   │       ├── repository.js             # import "server-only": database reads and writes only
│   │       ├── schemas.js                # zod schemas shared by actions and forms
│   │       ├── components/               # Feature UI, built from components/ui
│   │       ├── prompts/                  # AI prompts (when the feature uses AI)
│   │       ├── providers/ or strategies/ # Swappable implementations plus factory.js (see architecture.md)
│   │       └── lib/                      # Helpers used only inside this feature
│   │
│   ├── components/                       # Shared, feature-agnostic UI. Check here first.
│   │   ├── ui/                           # button, input, select, multi-pick, hybrid-multi-pick, dialog, card, skeleton,
│   │   │                                 # badge, pager, empty-state, tabs, switch, popover, bot-check, ...
│   │   ├── layout/                       # app-frame, sidebar, mobile-dock, user-menu, route-error
│   │   ├── charts/                       # Chart wrappers and chart theme
│   │   ├── theme/                        # Theme head and appearance sync
│   │   └── analytics/                    # Analytics loader with consent
│   │
│   ├── configs/                          # Every setting and list, one file per area. No magic values elsewhere.
│   │   ├── env.js                        # Reads and validates env vars; the only file that touches process.env
│   │   ├── public.js                     # Values safe for the browser (NEXT_PUBLIC_*)
│   │   ├── site.js                       # Name, URL, support email, socials
│   │   ├── site-status.js                # Site modes and which pages each mode allows
│   │   ├── app.js                        # App-wide settings (rate limits, timeouts)
│   │   ├── api.js                        # API_VERSION, API_ROUTES, apiPath()
│   │   ├── navigation.js                 # Menus and nav links
│   │   ├── plans.js, billing.js, credits.js
│   │   └── <area>.js                     # bot, analytics, email, ai, calendar, notifications, ...
│   │
│   ├── lib/                              # Shared plumbing, no feature logic
│   │   ├── action.js                     # Wraps every server action: zod input, auth, plan, rate limit, safe errors
│   │   ├── public-action.js              # Same wrapper for signed-out forms (with bot checks)
│   │   ├── context.js                    # requireSession, requireTenant, requirePlatformAdmin
│   │   ├── errors.js                     # AppError and friends
│   │   ├── cache.js                      # Server read cache, invalidated on every write
│   │   ├── events.js                     # Event bus: features emit, notifications subscribe
│   │   ├── toast.js                      # Toast wrapper (success, error, info) over the toast library
│   │   ├── api/
│   │   │   ├── http.js                   # fetch helper: getData, postData, putData, patchData, deleteData, uploadFile, ApiError
│   │   │   └── client.js                 # `api`: every browser call to API_ROUTES, grouped by feature
│   │   ├── supabase/                     # browser.js, server.js, admin.js, middleware.js clients
│   │   ├── email/send.js                 # Email sending adapter
│   │   ├── <service>/strategies/         # Shared swappable providers (e.g. location: mapbox, photon)
│   │   └── bot.js, throttle.js, crypto.js, format.js, utils.js, ...
│   │
│   ├── registry/                         # Copied third-party UI pieces (kept apart from our own components)
│   ├── assets/                           # Imported images (logos, textures)
│   └── middleware.js                     # Session refresh and site mode redirects (proxy.js on Next.js 16+)
│
├── supabase/
│   ├── schema.sql                        # Single source of truth, safe to run again and again
│   ├── seed.sql
│   ├── patches/                          # Dated one-off fixes for the hosted database
│   ├── tests/                            # SQL tests (row level security, credits, tenant isolation)
│   └── templates/                        # Auth email templates
│
├── public/                               # Static files (images, svgs, fonts)
├── scripts/                              # migrate.mjs, seed.mjs, reset.mjs, <tool>-setup.mjs (run via npm run)
├── docs/                                 # Plans, decisions, todo
├── .env.example                          # Every env var with placeholder values; real .env files are never committed
├── jsconfig.json                         # Path alias @/ → src/
├── next.config.mjs
├── postcss.config.mjs
└── vercel.json                           # Crons
```

### Frontend and Backend (Next.js)

There is no separate backend folder. The backend is the server-only layers inside each feature plus `lib/`, and the frontend is `app/` pages and `components/`.

| Layer            | Runs on                         | Files                                           |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| Pages and routes | Server (renders)                | `src/app/**/page.jsx`, `layout.jsx`             |
| UI               | Browser and server              | `src/components/`, `src/features/*/components/` |
| Server actions   | Server, called from the browser | `src/features/*/actions.js`                     |
| Business logic   | Server only                     | `src/features/*/service.js`                     |
| Data access      | Server only                     | `src/features/*/repository.js`                  |
| HTTP routes      | Server, called by URL           | `src/app/api/v1/**/route.js`                    |
| Shared plumbing  | Both (server-only files say so) | `src/lib/`                                      |
| Database         | Postgres                        | `supabase/schema.sql`                           |

### Data Flow (Next.js)

1. **Reads and writes go through server actions**, not HTTP routes: component → `actions.js` → `service.js` → `repository.js` → database.
2. **HTTP routes are only for what needs a URL:** webhooks, cron, OAuth, file downloads, audio, and data the browser preloads.
3. **Optimistic updates** use React's `useOptimistic` around the server action call, and the action refreshes the affected paths after it succeeds.
4. **Multi-step writes** use a database function, not several calls from the app.

### Rules (Next.js)

1. `src/app/` only handles routing, layouts, and metadata.
2. `actions.js` holds no business logic and no queries: validate, call one service function, refresh.
3. `service.js` and `repository.js` start with `import "server-only"`.
4. Features use each other only through `service.js` or `repository.js`.
5. All settings and lists live in `src/configs/`. Browser-safe values go through `configs/public.js`.
6. Every table has row level security, and every new database rule gets a test in `supabase/tests/`.

================================================================================

## React + Node (Express) Stack

React (Vite) on the client, Node with Express on the server, Postgres, Stripe, TanStack Query for data fetching and caching.

```
/
├── client/                               # React app (Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── jsconfig.json                     # Path alias @/ → src/
│   ├── .env.example                      # VITE_* values only; never secrets
│   ├── public/                           # Static files (images, svgs, fonts, robots.txt, sitemap.xml)
│   └── src/
│       ├── main.jsx                      # Mounts the app
│       ├── app/
│       │   ├── providers.jsx             # Query client, router, toaster, theme
│       │   ├── router.jsx                # Every route, each page lazy loaded
│       │   └── guards/                   # auth-guard.jsx, site-status-guard.jsx, admin-guard.jsx
│       │
│       ├── pages/                        # One folder per route. Thin: layout, metadata, feature components.
│       │   ├── home/
│       │   │   ├── home-page.jsx
│       │   │   └── hero.css              # Hero styles for this page only
│       │   ├── coming-soon/, unavailable/
│       │   └── <page>/
│       │
│       ├── features/                     # One folder per feature (frontend side)
│       │   └── <feature>/
│       │       ├── components/           # Feature UI, built from components/ui
│       │       ├── hooks/                # use-<feature>.js: queries and mutations with optimistic updates
│       │       ├── schemas.js            # Re-exports form schemas from shared/
│       │       └── lib/                  # Helpers used only inside this feature
│       │
│       ├── components/                   # Shared, feature-agnostic UI. Check here first.
│       │   ├── ui/                       # button, input, select, multi-pick, hybrid-multi-pick, dialog, card,
│       │   │                             # skeleton, badge, pager, empty-state, tabs, switch, popover, ...
│       │   ├── layout/                   # app-frame, sidebar, header, footer, route-error
│       │   └── seo/                      # page-meta.jsx (title, description, canonical, Open Graph), json-ld.jsx
│       │
│       ├── configs/                      # Frontend settings and lists, one file per area
│       │   ├── public.js                 # The only file that reads import.meta.env
│       │   ├── site.js                   # Name, URL, support email, socials
│       │   ├── api.js                    # API_VERSION, API_ROUTES, apiPath()
│       │   ├── query.js                  # Query keys, stale times, retry rules
│       │   ├── toast.js                  # Variants, durations, position
│       │   ├── navigation.js             # Menus and nav links
│       │   └── <area>.js
│       │
│       ├── lib/                          # Frontend plumbing, no feature logic
│       │   ├── api/
│       │   │   ├── http.js               # fetch helper: getData, postData, putData, patchData, deleteData, uploadFile, ApiError
│       │   │   └── client.js             # `api`: every call to API_ROUTES, grouped by feature
│       │   ├── query-client.js           # TanStack Query client and invalidation helpers
│       │   ├── toast.js                  # Toast wrapper (success, error, info)
│       │   └── format.js, utils.js, ...
│       │
│       ├── hooks/                        # Shared hooks (use-debounce.js, use-media-query.js)
│       ├── assets/                       # Imported images (logos, textures)
│       └── styles/
│           └── globals.css               # Tailwind and design tokens only
│
├── server/                               # Express app
│   ├── .env.example                      # Every server env var with placeholder values
│   ├── src/
│   │   ├── index.js                      # Starts the HTTP server
│   │   ├── app.js                        # Express app: security headers, CORS, body parsing, routes, error handler
│   │   ├── routes.js                     # Mounts each module's router under /api/v1
│   │   │
│   │   ├── modules/                      # One folder per feature (backend side)
│   │   │   └── <module>/
│   │   │       ├── routes.js             # Express router: path, middleware, controller function
│   │   │       ├── controller.js         # Reads req, calls one service function, sends the response
│   │   │       ├── service.js            # Business logic as fn(ctx, input); never sees req or res
│   │   │       ├── repository.js         # Database reads and writes only
│   │   │       ├── schemas.js            # Re-exports request schemas from shared/
│   │   │       ├── events.js             # Event names this module emits
│   │   │       └── strategies/           # Swappable implementations plus factory.js
│   │   │
│   │   ├── middleware/                   # auth.js, validate.js (zod), rate-limit.js, bot-check.js,
│   │   │                                 # site-status.js, error-handler.js, not-found.js
│   │   ├── configs/                      # Backend settings and lists, one file per area
│   │   │   ├── env.js                    # Reads and validates env vars; the only file that touches process.env
│   │   │   ├── app.js                    # Port, CORS origins, rate limits, timeouts
│   │   │   ├── site-status.js            # Site modes and which routes each mode allows
│   │   │   ├── db.js                     # Pool size, timeouts
│   │   │   └── plans.js, billing.js, email.js, <area>.js
│   │   │
│   │   ├── lib/                          # Backend plumbing, no feature logic
│   │   │   ├── errors.js                 # AppError and friends
│   │   │   ├── context.js                # Builds ctx (user, tenant, db) from the request
│   │   │   ├── events.js                 # Event bus: modules emit, notifications subscribe
│   │   │   ├── cache.js                  # Server read cache (Redis), invalidated on every write
│   │   │   ├── logger.js
│   │   │   ├── email/send.js             # Email sending adapter
│   │   │   └── <service>/strategies/     # Shared swappable providers
│   │   │
│   │   ├── db/
│   │   │   ├── client.js                 # Postgres connection pool and transaction helper
│   │   │   ├── migrations/               # Numbered schema changes
│   │   │   └── seeds/
│   │   │
│   │   └── jobs/                         # Scheduled jobs (digests, alerts, cleanup)
│   └── tests/                            # API and service tests, one folder per module
│
├── shared/                               # Plain JS used by both client and server
│   ├── schemas/                          # zod schemas for requests and forms, one file per feature
│   └── constants/                        # Enums and fixed lists both sides need
│
├── scripts/                              # migrate.mjs, seed.mjs, reset.mjs, <tool>-setup.mjs (run via npm run)
├── docs/                                 # Plans, decisions, todo
└── package.json                          # npm workspaces: client, server, shared
```

### Frontend and Backend (React + Node)

| Layer          | Runs on  | Files                                              |
| -------------- | -------- | -------------------------------------------------- |
| Pages          | Browser  | `client/src/pages/`                                |
| UI             | Browser  | `client/src/components/`, `features/*/components/` |
| Data hooks     | Browser  | `client/src/features/*/hooks/`                     |
| API calls      | Browser  | `client/src/lib/api/client.js`                     |
| Routes         | Server   | `server/src/modules/*/routes.js`                   |
| Controllers    | Server   | `server/src/modules/*/controller.js`               |
| Business logic | Server   | `server/src/modules/*/service.js`                  |
| Data access    | Server   | `server/src/modules/*/repository.js`               |
| Shared schemas | Both     | `shared/schemas/`                                  |
| Database       | Postgres | `server/src/db/migrations/`                        |

### Data Flow (React + Node)

1. **Every read and write is an HTTP call:** component → feature hook → `api.<feature>.<call>()` → Express route → `validate` middleware → `controller.js` → `service.js` → `repository.js` → database.
2. **Caching and optimistic updates live in the feature hooks.** Queries use keys and stale times from `configs/query.js`. Mutations update the cache first (`onMutate`), roll back on error (`onError`), and invalidate the related keys when done (`onSettled`).
3. **The server validates every request** with the same zod schema the client form uses, from `shared/schemas/`.
4. **Site modes are enforced on both sides:** the `site-status` middleware blocks API routes the current mode doesn't allow, and `site-status-guard.jsx` sends the browser to the right page.

### Rules (React + Node)

1. `client/` never imports from `server/`, and `server/` never imports from `client/`. Both may import from `shared/`. `shared/` imports from neither and holds no secrets.
2. `controller.js` holds no business logic and no queries: read the request, call one service function, send the response.
3. `service.js` never touches `req` or `res`. It takes `(ctx, input)` so it can be tested and reused by jobs.
4. Modules use each other only through `service.js` or `repository.js`.
5. Services throw `AppError`. Only `middleware/error-handler.js` turns errors into responses, and it never sends stack traces or raw database errors.
6. Only `server/src/configs/env.js` reads `process.env`, and only `client/src/configs/public.js` reads `import.meta.env`. Anything in the client env is public.
7. Every page is lazy loaded in `router.jsx`, so each page and its hero CSS load as their own chunk.
8. SEO: a plain React app renders in the browser, which search engines index poorly. Every public page sets its own metadata through `components/seo/page-meta.jsx`, and public marketing pages are prerendered at build time. If a project's public pages matter most for search, use the Next.js stack instead.
9. Every new endpoint, service rule, and migration gets a test in `server/tests/`.

================================================================================

## API Example (Both Stacks)

`configs/api.js` lists every route:

```js
export const API_VERSION = "v1";
export const API_BASE = `/api/${API_VERSION}`;

export const API_ROUTES = {
  auth: {
    login: "/auth/login",
  },
  cvs: {
    download: (id) => `/cvs/${encodeURIComponent(id)}/download`,
  },
};
```

`lib/api/client.js` turns them into calls the browser uses:

```js
import { API_ROUTES as R, apiPath } from "@/configs/api";
import { postData } from "./http";

export const api = {
  auth: {
    login: (data) => postData({ path: R.auth.login, data }),
  },
  cvs: {
    downloadUrl: (id, format = "pdf") => apiPath(R.cvs.download(id), { format }),
  },
};
```

Components then call `api.auth.login(data)`, never `fetch`. On React + Node, components call it through a feature hook so caching and optimistic updates stay in one place.
