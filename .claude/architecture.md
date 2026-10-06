# Architecture Rules

1. Strictly a modular monolith. Each module (feature or domain) owns its routes, services, data access, UI, and config. Modules talk to each other only through their public entry file (`index.js`), never by importing another module's internals.
2. Plain JavaScript only (`.js` / `.jsx`). No TypeScript, no `.ts` / `.tsx` files. Use JSDoc comments where types help.
3. Centralize configs. Every service and package, backend or frontend, has its own config file. Site modes and site-wide settings (environment, feature flags, site name, base URLs) live in `site.js`.
4. No hardcoded values or data. Text, URLs, colors, limits, dropdown options, and API endpoints come from config, constants, environment variables, or the database. Secrets live only in environment variables and are never committed.
5. Use proper design patterns for complex features so implementations can be swapped easily (see below).

## Design Patterns
Whenever a feature has interchangeable providers or behaviors, define one shared interface, put each implementation behind it, and pick the active one from config. Feature code calls the interface, never a specific provider, so switching is a config change rather than a rewrite.

- **Payments: Strategy pattern.** One strategy per provider (e.g. Stripe, PayPal), each exposing the same methods (`createPayment`, `refund`, `verifyWebhook`). The active provider is selected in the payments config.
- **Notifications: Strategy plus Observer.** One strategy per channel (email, SMS, push, in-app) behind a shared `send` method. Modules emit events (e.g. `order.created`) through an event bus, and the notification module subscribes and decides which channels to use. Modules never call a channel directly.
- **Toasts: Provider plus hook.** A single toast provider at the app root, used everywhere through a `useToast` hook (`success`, `error`, `info`). No component renders its own toast markup. Variants, durations, and positions come from config.
- **Third-party services in general: Adapter pattern.** Wrap every external SDK (storage, email, analytics, maps) in an adapter so the rest of the code never imports the SDK directly.
- **Choosing an implementation: Factory.** A small factory reads the config and returns the right strategy or adapter, so the selection logic lives in one place.
