# sayonlabs.store: Digital Product Vault Plan

By Laud Zion Cascalla · 2026-10-28

A storefront and key-locked vault for selling my own digital products, inspired by the model of resources.brewedops.cloud but with my own brand, products, and an automated checkout.

---

## 1. Reference: how resources.brewedops.cloud works

| Area | How it works |
| --- | --- |
| **Offer** | One bundle (a "Resource Vault") split into shelves: 30 reels, 15 Claude skills, 5 Chrome extensions, 6 files, 2 portfolio templates (58 items) |
| **Price** | ₱199 for 3 months of access, on up to 2 devices |
| **Payment** | Manual. Buyer scans a GCash QR (masked account name), screenshots the receipt, sends it on Messenger, then receives a key by hand |
| **Key** | Format `RV-XXXX-XXXX-XXXX` (12 characters, dashes auto-filled). The 3 months start on first use. No account needed |
| **Anti-sharing** | Key bound to browser and device, 2 device cap, logs IPs plus every download and play, 15 minute lockout after too many tries, admin can switch keys off |
| **Error states** | Key not found, expired, switched off, device limit reached, different browser, signed out, network error |
| **Policy** | All sales final, because the key unlocks everything immediately |
| **Tech** | Vite + React single-page app, dark/light theme, small API (`activate`, `session`, `signout`, `admin/login`, `admin/keys`). No real SEO: the public page is only a lock screen |

### What to keep
- One key unlocks everything: simple to buy, simple to use
- Shelves by product type
- Time-limited access with a device cap to discourage sharing
- Clear error messages for every key state

### What to do better
- **Instant, automated payment and key delivery** instead of waiting on Messenger
- **A public, indexable storefront** with product pages so search brings buyers
- **Optional email account** so a lost key can be recovered
- **Renewals** that extend an existing key instead of buying a new one
- **Single product purchases** alongside the full vault pass
- **Proper privacy disclosure** for logging (PH Data Privacy Act)

> Use my own branding, copy, and product content. Do not copy the reference site's layout, text, or assets.

---

## 2. Stack

The repo currently holds only the project rules, so this starts fresh on the **Next.js stack** from `.claude/folder-structure.md`. A storefront lives on search traffic, and Next.js renders on the server, which a plain Vite app does not.

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router), plain JavaScript |
| Database, auth, storage | Supabase (Postgres, row level security, private storage buckets) |
| Payments | PayMongo (GCash, Maya, cards) behind a payment **Strategy**; Stripe can be added later as another strategy |
| Email | Resend (or similar) behind the email adapter |
| Queue | pg-boss on Postgres behind `lib/queue/` with an outbox table |
| Styling | Tailwind with design tokens, sonner for toasts |
| Hosting | Vercel |

---

## 3. Data model

| Table | Purpose |
| --- | --- |
| `shelves` | Product categories (name, slug, order) |
| `products` | Title, slug, description, shelf, preview media, price (for single purchase), status |
| `product_files` | Private storage paths per product (downloads, videos) |
| `plans` | Vault pass and single product plans (price, duration months, device cap) |
| `orders` | Buyer email, plan, amount, status, provider reference, idempotency key |
| `access_keys` | Key code (unique), order, scope (full vault or product ids), first used at, expires at, status |
| `key_devices` | Device fingerprint, key, first seen, last seen |
| `access_logs` | Key, device, IP, action (activate, download, play), product |
| `webhook_events` | Provider event id (unique) so each webhook runs once |
| `manual_payments` | Receipt upload, reference number, status, reviewed by |
| `outbox` | Jobs written in the same transaction as the data |

All tables have row level security, foreign keys, and check constraints, with SQL tests in `supabase/tests/`.

---

## 4. Phases

### Phase 1: Foundation (week 1)
- Scaffold Next.js with the folder layout from the rules
- `configs/`: `site.js`, `site-status.js`, `plans.js`, `vault.js` (key format, duration, device cap, lockout), `payments.js`, `api.js`, `navigation.js`
- `.env.example`, `.env.local`, `.env.production` plus `npm run env:check`
- Scripts: `migrate`, `db:seed` (seeds the `admin` test account), `db:reset`, `paymongo:setup`
- Base components: button, input, skeleton, empty state, pager, single select, multi select, hybrid multi select

### Phase 2: Storefront and catalog (week 2)
- Public pages: home, shelf pages, product detail, pricing, FAQ, privacy, terms, refund policy
- Product detail shows previews (thumbnail, short demo clip, file list) with downloads locked
- SEO: metadata from data, Product and FAQ JSON-LD, sitemap, robots, Open Graph images
- Site mode `coming_soon` until launch

### Phase 3: Checkout and key delivery (week 3)
- **Automated flow:** choose plan → enter email → PayMongo checkout (GCash, Maya, card) → webhook verified and stored under a unique event id → order paid and key created in one transaction → key email queued after commit → success page shows the key
- **Manual fallback:** GCash QR plus receipt upload and reference number → admin approves → same key creation path
- Outgoing payment calls send an idempotency key built from the order id; the pay button disables while pending

### Phase 4: The vault (week 4)
- Key entry with auto-formatting (e.g. `SL-XXXX-XXXX-XXXX`) and a clear message for every state: not found, expired, switched off, device limit, signed out, too many tries, network error
- Access clock starts on first use; device cap enforced; rate limit stored in the database with `429` and `Retry-After`
- Downloads and videos served through short-lived signed URLs from private storage, never public links
- Shelves with search (debounced), filters, and pagination
- Renew button that extends the current key

### Phase 5: Admin console (week 5)
- Products and shelves CRUD with file uploads, previews, and the hybrid multi select for tags
- Orders list, manual payment review, refunds
- Keys: search, switch off, reset devices, extend, resend email
- Access logs and sharing alerts (one key on many IPs)
- Sales dashboard: revenue, orders, active keys, top products
- Guided tour for each admin area (per `onboarding.md`)

### Phase 6: Launch (week 6)
- Privacy notice covering device, IP, and download logging
- Terms and refund policy
- PayMongo live keys, domain `sayonlabs.store` on Vercel, analytics with consent
- Switch site mode from `coming_soon` to `live`

---

## 5. Decisions to make before building

1. **Products:** which product types and how many items at launch
2. **Pricing model:** time-limited vault pass, lifetime access, per product, or a mix
3. **Payment at launch:** PayMongo automated from day one, or manual GCash first
4. **Refund policy:** all sales final, or a short window before first download
5. **Accounts:** key only, or optional email sign-in for key recovery

---

## 6. Product backlog (to fill in)

| Shelf | Product | Format | Price | Status |
| --- | --- | --- | --- | --- |
| | | | | |
