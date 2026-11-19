---
name: seo-check
description: Audit public pages for SEO and Core Web Vitals. Checks titles, descriptions, canonicals, Open Graph, headings, alt text, JSON-LD, sitemap, robots, preloads, fonts, images and render blocking scripts, then fixes what it can. Use when the user runs /seo-check or asks about SEO, metadata or page speed.
argument-hint: "[page path or URL, default: all public pages]"
---

# /seo-check

## 1. Pages
`$ARGUMENTS`, or every public route (marketing, legal, blog). Skip signed-in and admin pages.

## 2. Per page
- Unique `title` and meta description from config or data, not hardcoded
- Canonical URL, Open Graph and Twitter tags, an OG image
- Exactly one `h1`, headings in order
- `alt` on meaningful images, `alt=""` on decorative ones
- Images: WebP or AVIF, width and height set, below the fold lazy loaded, hero image preloaded
- JSON-LD where it fits (Organization, Article, Product, Breadcrumb, FAQ)
- Descriptive link text, clean URLs
- Hero CSS in its own file next to the page

## 3. Site wide
- `sitemap.xml` lists every public page and nothing private; `robots.txt` points to it
- Preconnect to third party origins; no render blocking scripts
- Fonts: primary one preloaded, `font-display: swap`, few weights
- `noindex` on pages that should not be indexed (non-live site modes, admin)

## 4. Measure
Run Lighthouse (`npx lighthouse <url> --only-categories=performance,seo,accessibility --quiet --output=json`) on a production build. Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms. Delete the report files afterwards.

## 5. Report
Table: page · issue · fixed or not. Fix the safe ones, list the rest, then suggest a commit message.
