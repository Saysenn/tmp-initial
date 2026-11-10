# Dashboard Design Rules

Applies to every admin area, dashboard, and signed-in app screen. The goal is the same **feel** every time (calm, airy, soft, minimal, polished), never the same **layout**. Layout, menus, and content change per project; the visual language below does not.

## References
Sample designs live in `references/dashboard/`. Study them for **feel** (color, radius, depth, spacing), never copy their layout or content.

| File | Take from it |
| --- | --- |
| `01-teal-profile-hero.png` | Single teal accent, one big accent hero banner, white cards on a tinted canvas, pill tabs and toggles, help card in the sidebar |
| `02-indigo-analytics.png` | Indigo plus sky as accent and second series, soft icon chips, smooth line chart, rounded bars, roomy tables without grid lines |
| `03-dark-sidebar-kpi-avoid-tiles.png` | Clean chart area and roomy spacing. **Avoid** its row of solid multi color KPI tiles (see Never) |
| `04-sage-green-workspace.png` | Deep green sidebar as the one large accent area, muted sage tints, varied card sizes, soft badges and progress bars |

These rules work with @styles.md, @motion.md, and @ui-states.md. If they conflict, @styles.md wins.

## 1. The Feel
- Calm and airy: lots of whitespace, few borders, nothing shouting.
- Soft: large rounded corners, diffuse shadows, tinted surfaces instead of hard lines.
- One accent: a single brand hue does almost all the coloring. Everything else is neutral.
- Content first: the number, chart, or name leads. Chrome (borders, icons, labels) stays quiet.

## 2. Color System
Every project picks **one accent hue** and builds the whole palette from it as tokens in the theme file. Pick a fresh hue per project (teal, indigo, sage, deep green, violet, coral, ocean); never default to the same one.

| Token | Role | Rule |
| --- | --- | --- |
| `--canvas` | Page background behind cards | Very light, slightly tinted toward the accent (e.g. cool gray blue for indigo, warm gray green for sage). Never pure white. |
| `--surface` | Cards, sidebar, header | Pure or near white, so cards float on the canvas |
| `--surface-muted` | Inputs, inactive pills, table hovers | One step darker than surface |
| `--accent` | Active nav, primary buttons, key chart series, toggles | The one brand hue, AA contrast with white text |
| `--accent-soft` | Icon chips, selected rows, badges, chart fills | Accent at about 10 to 15% on surface |
| `--accent-strong` | Hover and pressed accent | Accent darkened about 10% |
| `--accent-2` | Second chart series only | Lighter or analogous hue of the accent (indigo plus sky, teal plus mint) |
| `--text` | Headings, numbers | Deep tinted navy or charcoal, never pure black |
| `--text-muted` | Labels, captions, axis ticks | Gray blue or gray green, still AA on its background |
| `--success` `--warning` `--danger` | Status and trend only | Soft versions, used on small things (deltas, badges), never big blocks |

Rules:
- No more than **one accent plus one supporting hue** on a screen. Status colors are only for meaning.
- Large colored areas (a hero banner, a feature card, a sidebar) use the accent or a deep shade of it, at most **one or two per screen**, to anchor the eye.
- No rainbow KPI tiles (one solid color per tile), no stock "blue, green, orange, purple" sets.
- Dark mode is built from the same tokens: dark tinted canvas, slightly lighter surfaces, same accent.

## 3. Shape and Depth
| Token | Value | Used for |
| --- | --- | --- |
| `--radius-sm` | 8 to 10px | Inputs, small buttons, badges, table cells |
| `--radius-md` | 12 to 16px | Cards, dropdowns, popovers |
| `--radius-lg` | 20 to 28px | App frame, hero banners, large panels |
| `--radius-full` | 9999px | Pills, toggles, avatars, search, segmented tabs |

- Nested corners stay concentric: inner radius = outer radius minus padding.
- Depth comes from **color contrast plus soft shadow**, not borders. Shadows are large, faint, and tinted with the accent or text color (e.g. `0 8px 30px rgb(var(--text-rgb) / 0.06)`), as `--shadow-card` and `--shadow-pop` tokens.
- Borders, when needed, are 1px in a soft neutral token. Never thick, never dark.
- The whole app can sit in a rounded frame on the canvas (sidebar plus content inside one large rounded surface).

## 4. Typography
- One clean sans family (e.g. Inter, Plus Jakarta Sans, DM Sans, Manrope), two or three weights.
- Big, bold numbers for KPIs; small, muted labels above or below them.
- Section titles semibold and modest in size. Small caps style labels (uppercase, letter spaced, muted) for group headings like sidebar sections.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`).

## 5. Spacing and Layout Feel
- Generous padding inside cards (20 to 28px) and consistent gaps between them (16 to 24px), all from the spacing scale.
- Use a grid, but vary card sizes: a wide chart beside a narrow list, one tall card, one hero card. Never a wall of equal boxes.
- Few elements per card: a title, one main thing, at most one action.
- Breadcrumb plus large page title at the top of content, header actions (search, notifications, avatar) grouped on the right.

## 6. Components
- **Sidebar:** light surface or one deep accent shade. Active item is clearly marked (accent pill, accent soft background, or a thin accent indicator) and inactive items are muted. Optional help or upgrade card at the bottom in the accent.
- **KPI tiles:** number leads. An icon, if used, sits in a small round or soft square chip in `--accent-soft`. Show the trend as a small colored delta (`+12%`). A sparkline is welcome.
- **Charts:** smooth curves, thin lines, soft gradient area fills fading to transparent, rounded bar tops, no heavy gridlines (faint horizontal only), muted axis labels, tooltip as a small accent pill. Load the `dataviz` skill before building any chart.
- **Tables:** no vertical lines, faint row dividers or none, muted header row, roomy rows, status as soft pill badges.
- **Buttons:** primary in solid accent, secondary as outline or ghost in accent, all `--radius-full` or `--radius-sm` consistently across the app.
- **Inputs and search:** filled with `--surface-muted` or white on canvas, pill shaped, icon inside, no hard border.
- **Toggles, tabs, segmented controls:** pill shaped, accent when on.
- **Avatars:** round, stacked with a small overlap and a surface colored ring.

## 7. Never
- Glass or frosted panels, heavy gradients, neon glows (see @styles.md).
- Dark, saturated full color KPI tiles in a row.
- Thick borders, boxed tables with grid lines, harsh drop shadows.
- Pure black text or pure white canvas.
- Two different radius styles or two accent colors fighting on one screen.
- Copying the same layout, menu set, or card arrangement from the last project.

## 8. Per Project Checklist
Before building a new dashboard, decide and record in the theme file:
1. Accent hue and its soft, strong, and second series shades.
2. Canvas tint and text tint that match the accent.
3. Radius scale (pick within the ranges above) and shadow tokens.
4. Font family.
5. Which one or two places get a large accent area (hero, sidebar, feature card).

Then verify with the browser extension at phone, tablet, and desktop widths, in light and dark mode, and check WCAG AA contrast on every text and accent pairing.
