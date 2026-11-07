# Motion Rules

Before and after examples for each rule are in `references/ui-motion/` (`01-ease-out-entrances.webp` to `20-shared-layout-id.webp`).

## Tokens
All durations, easings, scales, and offsets are motion tokens in the central theme file (CSS variables) and mirrored in `configs/motion.js` for JS animations. Never hardcode them in components.

| Token | Value |
| --- | --- |
| `--ease-out` (entrances) | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-in-out` (on screen moves) | `cubic-bezier(0.77, 0, 0.175, 1)` |
| `--duration-fast` (press, hover, icon swap) | `150ms` |
| `--duration-base` (dropdowns, popovers) | `200ms` (allowed range 150 to 250ms) |
| `--duration-move` (on screen moves) | `300ms` |
| `--exit-ratio` | `0.8` (exits are 20% shorter) |
| `--stagger-step` | `30ms` |
| `--press-scale` | `0.97` |
| `--popover-start-scale` | `0.95` |
| `--knob-stretch` | `1.12` |

## Timing and Easing
1. **Ease out for things coming in.** Entrances use `--ease-out`, never `ease-in` (it feels slow to start). [01]
2. **Dropdowns, menus, and popovers open in 150 to 250ms,** never slower. [02]
3. **Ease in and out for things moving on screen** from one place to another, never `linear`. [09]
4. **Exits are about 20% shorter than entrances** (for example 250ms in, 200ms out). [15]
5. **No bouncy springs on everyday UI** (menus, dialogs, toasts, tabs). Use critically damped springs or the easings above. Bounce is only for rare, playful moments. [13]

## Sequencing
6. **List rows appear one after another, 30ms apart.** Cap the stagger (for example the first 10 rows) so long lists do not feel slow. [03]
7. **Small details settle one after another, not all at once** (title, then meta, then actions). [06]
8. **The new state comes in while the old one leaves.** Overlap them, never leave a blank gap in between. [16]

## Feedback
9. **Buttons shrink to 0.97 when pressed** (`:active { transform: scale(var(--press-scale)) }`, fast). [04]
10. **A moving toggle knob stretches about 12% while it slides,** preserving its area, then settles back to a circle. [05]
11. **A small pulse confirms success** (a short scale or ring pulse on the confirmed element). [08]
12. **Icons swap with a crossfade plus scale and blur** (old one fades out, scales down, and blurs while the new one does the reverse). [18]

## Origin and Path
13. **Popovers start at 95% size and full layout,** never from scale 0. [10]
14. **Things open from the button that triggered them,** not from the centre (set `transform-origin` toward the trigger). [11]
15. **They close back toward that button.** [12]
16. **Objects move along a curve, not a straight line,** when they travel across the screen (for example add to cart flying into the cart icon). [07]
17. **When an item opens into a bigger view, it grows out of the same element** (a shared layout id, for example Motion `layoutId` or the View Transitions API), not a separate element that appears. [20]

## Reveals
18. **Use masks for reveals and colour changes, not plain fades** (`clip-path` or `mask` for tab content, highlight pills, and text colour changes). [17]

## Direct Manipulation
19. **While the user is dragging, the object follows the pointer directly** with no easing or tween. Easing applies only after release. [14]
20. **Dragging past a limit stretches with growing resistance** (rubber band), then snaps back on release. Never a hard stop at the edge. [19]

## Always
- Animate only `transform`, `opacity`, `clip-path`, and `filter`, never layout properties (`width`, `top`, `margin`), so motion stays smooth and causes no layout shift.
- Respect `prefers-reduced-motion`: replace movement and scaling with a short opacity change, and turn off stagger, pulses, and rubber banding.
- Motion never blocks input: users can click the next thing while an animation is still running.
- Use one motion library, wrapped in a shared helper (`lib/motion.js`), so it can be swapped (see the Adapter pattern in @architecture.md).
