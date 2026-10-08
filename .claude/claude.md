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
2. Cache properly, and invalidate or refresh the cache whenever new values arrive (after mutations or fresh fetches) so stale data is never shown.
3. Use proper optimization techniques: lazy load routes and heavy components, debounce search inputs, paginate large lists, and memoize only where it measurably helps.
4. Images: use modern formats (WebP/AVIF), set explicit width and height to avoid layout shift, and lazy load anything below the fold.

## SEO and Design
1. Consider SEO and accessibility when choosing colors and designing: sufficient contrast (WCAG AA), readable font sizes, and a logical heading order.
2. Follow the detailed rules in these files:
   - @seo.md
   - @styles.md
   - @contents.md
