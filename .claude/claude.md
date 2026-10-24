# Project Rules

## Architecture
Follow the architecture rules in @architecture.md and the folder layout in @folder-structure.md

## Components
1. Components first. Before writing any UI, check the existing components (links, buttons, pagination, tables, skeletons, search boxes, etc.) and reuse them. If a small piece is missing, create it as a reusable React component instead of inlining the markup.
2. Dropdowns: always build three components:
   - a single-select dropdown
   - a multi-select dropdown
   - an advanced hybrid multi-select dropdown with a built-in sidebar that shows the selected options as you pick them

   For dropdowns with many options, use the hybrid version: a built-in search bar plus the ability to add a new value on the spot.
3. Every data-driven component handles loading (skeletons), empty, and error states.
4. Accessible by default: semantic HTML, labels on inputs, keyboard navigation, and visible focus states.

## Data and Performance
1. Use optimistic UI updates for all CRUD operations, with rollback and an error message if the request fails.
2. Cache properly, and invalidate or refresh the cache whenever new values arrive (after mutations or fresh fetches) so stale data is never shown. See Caching in @architecture.md.
3. Use proper optimization techniques: lazy load routes and heavy components, debounce search inputs, paginate large lists, and memoize only where it measurably helps.
4. Images: use modern formats (WebP/AVIF), set explicit width and height to avoid layout shift, and lazy load anything below the fold.

## Navigation and Loading
1. Instant navigation: clicking a menu item switches to that page immediately, without waiting for the server or the page's data.
   - Use the framework's link component with prefetching (Next.js `<Link>`; on React Router, preload the lazy route on hover or when the link is visible).
   - Every route has a loading skeleton that matches its layout (Next.js `loading.jsx`, or a Suspense fallback per route), shown the moment the user clicks.
   - The sidebar and header stay mounted; only the content area changes. The clicked menu item shows as active right away.
   - Data loads inside the page (streaming or Suspense), never before navigation.
2. Loading screen after sign-in: a short screen with a progress bar and a checklist of the real steps being prepared (e.g. "Signing you in", "Loading your workspace", "Fetching your dashboard", "Preparing notifications").
   - Each item checks off when its actual request finishes, and the progress bar follows the finished steps. No fake timers.
   - Steps run in parallel where possible, and their results go straight into the cache so the dashboard shows data instantly.
   - Steps and labels come from config. Show it only on a fresh sign-in, not on every page load.
   - If everything finishes almost instantly, skip the screen. If one step is slow, continue to the app after a time limit from config and let that section show its skeleton. A failed step offers a retry instead of blocking the user.
   - Accessible: progress announced to screen readers, and `prefers-reduced-motion` respected.

## SEO and Design
1. Consider SEO and accessibility when choosing colors and designing: sufficient contrast (WCAG AA), readable font sizes, and a logical heading order.
2. Follow the detailed rules in these files:
   - @seo.md
   - @styles.md
   - @contents.md

## Onboarding
Admin areas and dashboards ship with guided tours for non-technical users. Follow @onboarding.md.

## Security
1. Projects start in development and testing, so `npm run db:seed` creates a default test account: username `admin`, password `Joker1234!`. The values live in `.env.example` (`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`), not in code.
2. The test account exists only in local and test databases. The seed script refuses to run in production, and the account must never reach a hosted database.
3. During local development and testing, sign in with the test account yourself through the Claude browser extension. No need to ask first.


## Development
1. never commit anything yourself  - I do the committing myself
2. if i told you to log in, you login. never ask me to login myself. you login if i told you so to open admins or dashboard pages. i won't tell you to login if it's not safe so you listen to me.


