# SEO and Performance Rules

## Critical Rendering
1. Keep each page's hero section CSS in its own stylesheet. Do not bundle hero styling into one compiled CSS file.
2. Preload critical hero assets: everything visible in the initial viewport, including elements that are only partly visible and need a scroll to see in full.
3. Preconnect to CDNs and any third-party origins the page uses.
4. Prefetch images and assets that will be needed soon as the user scrolls.
5. Defer non-critical JavaScript. No render-blocking scripts.
6. Fonts: preload the primary font, use `font-display: swap`, and limit the number of weights loaded.

## Core Web Vitals Targets
- LCP under 2.5s
- CLS under 0.1
- INP under 200ms

## On-Page SEO
1. Every page has a unique title, meta description, and canonical URL, all sourced from config or data, never hardcoded.
2. Add Open Graph and Twitter card tags to every page.
3. Exactly one `h1` per page, with headings in logical order (`h1` → `h2` → `h3`).
4. Descriptive `alt` text on every meaningful image; empty `alt=""` on decorative ones.
5. Add structured data (JSON-LD) where relevant (organization, articles, products, breadcrumbs, FAQs).
6. Use descriptive link text (never "click here") and clean, readable URLs.
7. Generate and keep `sitemap.xml` and `robots.txt` up to date.
