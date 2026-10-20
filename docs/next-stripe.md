# Next Stripe: our own Stripe toolkit for Next.js

A plan for building a reusable Stripe package for Next.js (App Router), taking the good ideas from Vue Stripe (github.com/vue-stripe/vue-stripe, by Joff Tiquez) and the payment code already proven in ellthelabel.

Working name: `next-stripe` (check npm first: an older, unmaintained `next-stripe` package for the Pages Router existed, so we may need a scoped name such as `@ellthelabel/next-stripe`).

## 1. Short answer: can we make our own?

Yes, but we should not copy what Vue Stripe does for Vue. React already has Stripe's official `@stripe/react-stripe-js`, so another set of payment form components would add little.

What Next.js is missing is everything around the form:

| Area | What exists today | The gap we fill |
| --- | --- | --- |
| Payment form components | `@stripe/react-stripe-js` (official) | Nothing to build; we re-export it with a lazy, server safe loader |
| Terminal setup | Stripe CLI, but you wire it up by hand | One command: login check, keys into `.env.local`, webhook secret, npm scripts |
| Local webhooks | `stripe listen` with a long command | `next-stripe dev`: runs `next dev` and the listener together, events read from config |
| Test data | `stripe fixtures` with a JSON file | `next-stripe sync`: products and prices from a config file, safe to run again |
| Webhook route | Every project writes its own | `createWebhookHandler()`: signature check, raw body, dedupe, retries, typed handlers |
| Idempotency and safety | Every project gets it wrong at least once | Built in keys, event log adapter, ownership checks on saved cards |
| Server actions | None | `createCheckout`, `listCards`, `removeCard`, `customerPortal` helpers |
| Preview mode | None | A mock provider so a shop can run with no Stripe keys |

So the toolkit is mostly the **server and terminal side**, which is where ellthelabel already has tested, working code.

## 2. What we borrow from Vue Stripe

| Vue Stripe idea | How it shows up here |
| --- | --- |
| Lazy Stripe.js load, never on the server | `<StripeProvider>` loads Stripe.js on first use only, from the `pure` entry |
| Shared load when several components ask at once | One cached promise per key and options, same as his `load-stripe.ts` |
| One Stripe instance per key (avoids leaking iframes) | Instance map keyed by key, account and locale |
| A factory that builds every piece from a small definition | Webhook event handlers and server helpers built from definitions, not hand written per event |
| Clear errors when used in the wrong place | Errors that say exactly what is missing ("STRIPE_WEBHOOK_SECRET is not set; run `npx next-stripe init`") |
| `stripe fixtures` seeding in one command | `next-stripe sync` from `stripe.config.js` |
| Daily GitHub Action watching for new Stripe.js releases | Same action, watching both `stripe` (Node) and `@stripe/stripe-js` |
| Real browser tests against Stripe's UI | Playwright tests against a Stripe test account |

## 3. What the developer experience should look like

```bash
npm i next-stripe
npx next-stripe init     # once: checks the Stripe CLI and login, writes test keys to .env.local, adds scripts
npx next-stripe sync     # products, prices and the webhook endpoint from stripe.config.js
npm run dev:stripe       # next dev plus the webhook listener, webhook secret written to .env.local
```

`stripe.config.js` at the project root is the single source of truth:

```js
/** @type {import('next-stripe').Config} */
export default {
  currency: 'gbp',
  apiVersion: '2025-09-30.clover',
  webhookPath: '/api/v1/payments/webhook/stripe',
  events: ['checkout.session.completed', 'checkout.session.expired', 'charge.refunded'],
  savedCards: { enabled: true, reuse: 'on_session' },
  products: [{ id: 'gift-card-25', name: 'Gift card', price: 2500 }],
}
```

The webhook route becomes a few lines:

```js
// src/app/api/v1/payments/webhook/stripe/route.js
import { createWebhookHandler } from 'next-stripe/server'
import { eventStore } from '@/lib/stripe-event-store'

export const POST = createWebhookHandler({
  store: eventStore,
  on: {
    'checkout.session.completed': async (event, ctx) => { /* mark order paid */ },
    'charge.refunded': async (event, ctx) => { /* record refund */ },
  },
})
```

## 4. Package layout

One npm package with separate entry points, so browser code never pulls in the Node SDK:

| Entry | Runs on | Contents |
| --- | --- | --- |
| `next-stripe/cli` | Terminal | `init`, `dev`, `sync`, `doctor`, `fixtures` commands |
| `next-stripe/server` | Server only (`import 'server-only'`) | Stripe client factory, webhook handler, idempotency keys, customers, saved cards, refunds |
| `next-stripe/client` | Browser (`'use client'`) | `<StripeProvider>`, `<EmbeddedCheckout>`, `useStripeAction()`, re-exports from `@stripe/react-stripe-js` |
| `next-stripe/adapters/*` | Server | Event log stores: memory, Postgres, Supabase, Prisma |
| `next-stripe/mock` | Server | A mock provider with the same methods, for preview mode and tests |

Repo (separate from ellthelabel):

```
next-stripe/
├── packages/next-stripe/       # the library
│   ├── src/cli/                 # init.js, dev.js, sync.js, doctor.js
│   ├── src/server/              # client.js, webhook.js, idempotency.js, customers.js, cards.js, refunds.js
│   ├── src/client/              # provider.jsx, embedded-checkout.jsx, load-stripe.js
│   ├── src/adapters/            # memory.js, postgres.js, supabase.js
│   └── src/mock/
├── apps/demo/                   # a small Next.js shop using every feature
├── tools/e2e/                   # Playwright against a Stripe test account
├── fixtures/stripe-fixtures.json
└── .github/workflows/           # ci, release, stripe release watch
```

Written in plain JavaScript with JSDoc, like ellthelabel. Type files (`.d.ts`) are generated from the JSDoc at build time (`tsc --allowJs --declaration --emitDeclarationOnly`), so TypeScript users still get autocomplete.

## 5. The CLI in detail

| Command | What it does | Safety |
| --- | --- | --- |
| `init` | Checks the Stripe CLI is installed (prints the install command if not), checks `stripe login`, asks for or reads test keys, writes them to `.env.local`, adds `stripe.config.js` and npm scripts, makes sure `.env*.local` is in `.gitignore` | Refuses live keys; never prints a key; never overwrites an existing value without asking |
| `dev` | Runs `next dev` and `stripe listen --forward-to <webhookPath> --events <config events>`, captures the signing secret with `--print-secret` and writes it to `.env.local` | Test mode only; stops both processes together |
| `sync` | Creates or updates products, prices and the webhook endpoint to match the config | Safe to run again; live mode needs `--yes`; prints the webhook secret once and never saves a live secret to disk |
| `doctor` | Checks keys, key mode, API version, webhook endpoint events against the config, recent webhook failures | Read only |
| `fixtures` | Loads test customers and orders through `stripe fixtures` | Test mode only |

## 6. The server side in detail

Taken from what ellthelabel already does, made generic:

1. **Webhook handler**
   - reads the raw body with `request.text()`
   - verifies the signature with `constructEventAsync`, which also works on the Edge runtime
   - claims the event in the store, so a resent event is never processed twice
   - runs the handler, then marks the event done
   - returns 200 for unknown events and 400 only for bad signatures
   - on a handler error it returns 500 so Stripe retries, and the event stays open
2. **Idempotency keys:** helpers like `idempotencyKey('refund', orderId, amount)`, so a retried click never charges or refunds twice.
3. **Checkout:**
   - `createCheckout({ items, customer, successUrl, cancelUrl })`, with hosted or embedded checkout
   - expires the previous session for the same order before making a new one
   - attaches the saved customer when one exists
4. **Customers and saved cards:**
   - `ensureCustomer(userId)`, which is idempotent per user
   - `listCards(customerId)`
   - `removeCard(customerId, cardId)`, which refuses a card that belongs to another customer
5. **Refunds:**
   - `refund({ paymentIntent, amount, key })`
   - the app reserves the amount in its own database first, the pattern from our `reserve_refund` and `complete_refund`
6. **Soft fail:** every helper throws one `StripeKitError` with a safe, user friendly message and a `retryable` flag, so the site can show a notice instead of crashing.
7. **Event store interface:**
   - `claim(event)`
   - `finish(id, { error, note })`
   - `recentFailures()`
   - Adapters ship for memory (tests), Postgres (a SQL file with the table) and Supabase.

What stays in each app, not the toolkit:
- order tables and state changes, such as our `mark_order_paid` function
- emails
- the job queue

The toolkit calls the app's handlers; it never owns the app's database.

## 7. The client side in detail

1. **`<StripeProvider publishableKey locale>`:**
   - a client component that loads Stripe.js lazily from `@stripe/stripe-js/pure`
   - shares one load and caches one instance per key
   - never runs on the server
2. **`<EmbeddedCheckout action={createCheckoutAction} />`:** takes a server action that returns the client secret, so no API route is needed.
3. **`useStripeAction(action)`:** gives back `{ run, pending, error }` around a server action, built on `useTransition`.
4. **Re-exports:** everything from `@stripe/react-stripe-js` (`PaymentElement`, `AddressElement`, `ExpressCheckoutElement`), so one import covers it all.

## 8. Phases

| Phase | Work | Done when | Estimate |
| --- | --- | --- | --- |
| **0. Tidy in ellthelabel** | Add `npm run stripe:listen` and `npm run dev:stripe` here first; move the generic parts of `features/payments/strategies/stripe.js` and `webhook.js` into clear functions with no ellthelabel imports | Our own checkout still passes the tests in section 9 | 1 to 2 days |
| **1. Package skeleton** | New repo, workspace, build (ESM and CJS, generated types), lint, Vitest, CI, MIT licence | `npm pack` produces a working package | 1 day |
| **2. CLI** | `init`, `dev`, `doctor`, then `sync` and `fixtures` | A fresh `create-next-app` project reaches a working test webhook in under 5 minutes | 3 to 4 days |
| **3. Server** | Webhook handler, event store adapters, idempotency, checkout, customers, cards, refunds, mock provider | Unit tests for every helper; the demo app takes a test payment | 4 to 5 days |
| **4. Client** | Provider, lazy loader, embedded checkout, `useStripeAction` | Demo app works with hosted and embedded checkout | 2 days |
| **5. Tests and docs** | Playwright suite (card, 3D Secure, declined, saved card, refund), docs site with copyable examples | Green CI against a Stripe test account | 3 days |
| **6. Use it in ellthelabel** | Swap our Stripe strategy and webhook route to the package behind the existing strategy pattern | Every test from section 9 passes again, nothing changes for shoppers | 1 to 2 days |
| **7. Publish** | npm release with provenance, changelog, Stripe release watch action | Version 0.1.0 on npm | 1 day |

Total: about 3 to 4 weeks of focused work. Phase 0 is useful on its own even if we stop there.

## 9. Tests every release must pass

Taken from what we already proved on ellthelabel (orders ELL1001 to ELL1011):

- normal card payment
- 3D Secure payment
- declined card, then a successful retry
- saved card used in one tap
- someone else's card refused on removal
- same webhook sent twice: processed once
- two payments for one order: the second is refunded automatically
- wrong amount: the order stays unpaid and is flagged
- two refunds at once: only one goes through
- refund made in the Stripe dashboard: recorded once
- Stripe unreachable: the site shows a notice and stays up
- production build passes

## 10. Security rules

1. Secret keys and webhook secrets live only in server env vars. The CLI writes them to `.env.local` and never prints them.
2. `server` entry starts with `import 'server-only'`, so importing it in a client component fails the build.
3. Live keys need an explicit `--yes` and are never written to disk by the CLI.
4. Every money moving call takes an idempotency key; the helpers make one when the caller does not.
5. Saved card removal always checks the card belongs to the signed in customer.
6. Errors shown to shoppers never include Stripe's raw message or IDs.
7. No telemetry, and no network calls except to Stripe.

## 11. Keeping it up to date

- A daily GitHub Action compares the `stripe` and `@stripe/stripe-js` versions on npm with ours and opens an upgrade issue (the Vue Stripe approach).
- Pin one Stripe API version per release; changing it is a minor release with notes.
- Conventional commits and an automatic changelog.

## 12. Open decisions

1. **Name:** `next-stripe` if free on npm, otherwise a scoped name.
2. **Public or private:** publish openly (more users find bugs, good for reputation) or keep it private for our own client sites.
3. **Subscriptions:** not needed for ellthelabel. Add them in a later version, or never.
4. **PayPal:** stay Stripe only, or make the toolkit provider neutral like our strategy pattern. Recommendation: Stripe only, and keep provider switching in each app.

## 13. Recommendation

Start with Phase 0 inside ellthelabel this week. It gives us the one command local setup straight away. Then build the package only if we want to reuse it on other client sites. The server and CLI parts are where the real value is; the form components are already solved by Stripe.
