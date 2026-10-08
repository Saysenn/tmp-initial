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

## Design Patterns
Whenever a feature has interchangeable providers or behaviors, define one shared interface, put each implementation behind it, and pick the active one from config. Feature code calls the interface, never a specific provider, so switching is a config change rather than a rewrite.

- **Payments: Strategy pattern.** One strategy per provider (e.g. Stripe, PayPal), each exposing the same methods (`createPayment`, `refund`, `verifyWebhook`). The active provider is selected in the payments config.
- **Notifications: Strategy plus Observer.** One strategy per channel (email, SMS, push, in-app) behind a shared `send` method. Features emit events (e.g. `order.created`) through the server's event bus (`lib/events.js`), and the notifications feature subscribes and decides which channels to use. Features never call a channel directly.
- **Toasts: one Toaster plus a wrapper.** A single `<Toaster />` at the app root. Features call a shared wrapper in the frontend `lib/toast.js` (`success`, `error`, `info`), never the toast library directly, so the library can be swapped. No component renders its own toast markup. Variants, durations, and positions come from config.
- **Third-party services in general: Adapter pattern.** Wrap every external SDK (storage, email, analytics, maps) in an adapter so the rest of the code never imports the SDK directly.
- **Choosing an implementation: Factory.** A small factory reads the config and returns the right strategy or adapter, so the selection logic lives in one place.
