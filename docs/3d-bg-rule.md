# 3D scroll background: playbook

How the Palletable home page story was built and tuned, written to reuse on the next project. The Brighthive site reuses the same approach (a home page story plus a lighter ambient hive behind the inner pages); the file names, the performance rules and the slow device testing below are from this project and were found by profiling.

## The idea

A 3D scene sits fixed behind the page. Story cards scroll over it, and the scroll position acts like a video
scrubber: scrolling forward plays the scene, scrolling back rewinds it. Here it follows one box from the racks,
onto a pallet and a lorry, to a shop shelf.

Steps we took:
1. Wrote the story as beats first (range, prices, pallet, order, delivery, shelves).
2. Built a still CSS carton as a placeholder, then the real three.js scene.
3. Tuned for speed, then smoothness, then phones.

## Structure

| Piece | File | Job |
| --- | --- | --- |
| Story markup | `src/features/home/components/story.jsx` | Server rendered chapters (SEO and text), sticky stage behind them |
| Stage | `src/features/home/components/story-stage.jsx` | Measures chapters, turns scroll into progress, loads the scene, runs the loader |
| Home scene | `src/features/home/strategies/scrub/story.js` | Globe, core, traces, hive and camera shots on the timeline |
| Inner page backdrop | `src/components/layout/ambient-backdrop.jsx` + `src/lib/scene/strategies/ambient.js` | Lighter hive behind the other pages, scrubbed by page scroll |
| Engine | `src/lib/scene/engine.js` | Renderer, easing, pointer parallax, adaptive resolution, render loop, warm up |
| Models and textures | `src/lib/scene/models.js`, `src/lib/scene/textures.js` | Built in code; textures drawn on canvas (no image downloads) |
| Browser checks | `src/lib/scene/support.js` | Reduced motion and WebGL checks, colours from CSS tokens, font loading |
| Settings | `src/configs/scene.js` | Timeline map, smoothing, resolution caps, lite mode, slow frame limits, bloom |
| Factories | `src/features/home/strategies/scrub/factory.js`, `src/lib/scene/factory.js` | Pick the strategy from config and lazy load it |

Rules:
- **The scene never knows about the page.** It only exposes `setProgress`, `resize`, `start`, `stop` and `dispose`.
- **The timeline is measured in steps,** for example 0 to 7, with beats such as `drive: [5.12, 5.95]`.
- **Cards map onto steps through `timelineMap`.** That lets you change the number of cards without touching any animation.
- **Text lives in config** and is server rendered. The canvas is decoration only (`aria-hidden`).

## Fast

| What | Why |
| --- | --- |
| Lazy load three.js, and start the `import()` when the stage module runs | It never blocks the page; about 130KB gzip downloads in parallel |
| Draw textures on canvas from theme colours | Zero image requests; recolours with the theme |
| `compileAsync` then one hidden full draw (`warmUp`) before the first frame | No stutter the first time an object appears |
| Loading screen on every visit until the first 3D frame (15 s safety limit) | Users never see a frozen box; the scene moves the moment the screen lifts |
| Check WebGL and reduced motion before loading | Remote desktops and reduced motion users skip the 3D and get a still frame |
| Still frame poster captured from the real scene (desktop and phone crops, WebP, about 100KB) | The fallback looks like the scene, not a placeholder |
| Lite mode (narrow, touch or low memory): half rate idle frames and lower resolution caps, same look | Phones save CPU without the scene looking different |

## Smooth

| What | Why |
| --- | --- |
| Exponential easing toward the scroll target: `current += (target - current) * (1 - exp(-dt * k))` | Feels like scrubbing, frame rate independent |
| Render only while the stage is on screen (IntersectionObserver); idle renders every other frame | Saves battery and CPU |
| Shadow map `autoUpdate = false`, updated only when moving | Shadows are the most expensive pass |
| Adaptive resolution: median of 30 frames, step down 0.25 when slow | Keeps 60fps on weak devices without reacting to one hitch |
| Resolution floor (1.5 on phones), antialiasing always on | Slow devices get softer, never blocky |
| Long moves (the lorry drive) get one eased curve, synced with the camera, and their own card of scroll | Short windows make objects look like they teleport |
| HTML overlays (product cards) animate only on scroll, use `will-change` and light shadows, have no idle loops | Overlays should never cost the scene frames |

## Performance rules: do and don't

Found by profiling this site on throttled phones. Break one of these and slow phones hitch while scrolling.

**Don't**
- **Transparent plus `DoubleSide` without `forceSinglePass: true`.** three.js draws such a material in two passes (back, then front) and sets `material.needsUpdate = true` before each pass (`renderObject` in WebGLRenderer). So `getParameters` and `getProgramCacheKey` run for every such mesh on every frame. The 12 trace pad rings in `createTraces` (`src/lib/scene/models.js`) did this and caused the scroll hitches. Any transparent double sided material gets `forceSinglePass: true`, or use `FrontSide`.
- **Bumping `material.version` in an animate loop.** No `material.needsUpdate = true`, and no `alphaTest` that crosses 0 (that changes the shader). Animate `opacity`, `color` and uniforms instead. Attribute updates (`instanceMatrix.needsUpdate`) are fine; they do not touch the program.
- **Hiding or showing anything that contains a light.** A different number of visible lights changes the lights state, and every lit material re-derives (and may recompile) its program. Keep lights in groups that are always visible and fade `intensity`. Today the only `PointLight` is in the core (`createCore`), its group is never hidden, and `core.set` fades its intensity; keep it that way. Groups without lights (satellites, pulses, globe, streams) may toggle `visible`.
- **Device dependent bloom.** Bloom is off everywhere (`bloom: null` in `src/configs/scene.js`). Gating it on `navigator.deviceMemory` failed because Brave spoofs that value, so the live site came out over bright for some visitors. The scenes draw their own glow with additive sprites, so every device renders the same picture.
- **`backdrop-filter` blur over the moving scene on phones.** It is turned off for `(pointer: coarse), (max-width: 767px)` in `src/app/globals.css` (`.surface` uses near solid glass there).
- **Fading glass cards with the JS reveal.** A blurred card inside an opacity reveal shows its blur late. Glass cards stay at opacity 1 and get motion only.
- **Setting attributes from the motion root before hydration.** `src/components/motion/motion-root.jsx` waits for React to hydrate first; otherwise React logs hydration warnings.
- **JS reveal on above the fold text.** It delays LCP. Use the CSS `.rise-now` animation there.
- **Big animated SVGs used as a CSS mask or background.** Browsers repaint an animated SVG image on the main thread every frame, at full device resolution, for every element that uses it, and parsing it is a long task too. The hero honeycomb fill (`/hero-hex.svg`, 1,375 animated cells, three times wider than any headline) froze phones for 200 to 380 ms and stuttered for about a second right as the loading screen lifted, exactly when people start swiping. Fix: size the strip to the widest real line (`HEX_FILL` in `src/features/home/lib/hex-fill.js`, 2400 wide) and serve touch screens `/hero-hex-compact.svg` (`HEX_FILL_COMPACT`: bigger cells, 350 of them) through a `(pointer: coarse), (max-width: 767px)` query in `hero.css`. Keep animated SVG images small; animate transforms or opacity on elements instead when you can.

**Do (already in place, keep it)**
- **Lite mode** (`engine.js`): narrow container (under `wideMinWidth`), coarse pointer, or `navigator.deviceMemory <= lite.maxMemoryGb` (4). It renders only half the idle frames while nothing moves, and never changes the look.
- **Pixel ratio caps:** `maxPixelRatio` 1.5 on wide screens, `mobileMaxPixelRatio` 1.5 on narrow ones.
- **Adaptive resolution:** median of 30 frames; when it is over `slowFrameMs` (20) the pixel ratio steps down by 0.25, to a floor of `mobileMinPixelRatio` (1.25) on narrow screens or `minPixelRatio` (1) otherwise.
- **Too slow safety net:** at the floor, two windows in a row with a median over `tooSlowMs` (45) call `onTooSlow`, which disposes the scene and shows the still backdrop.
- **Shader warm up:** `warmUp` makes every object visible, runs `renderer.compileAsync` (when `KHR_parallel_shader_compile` is there) and one hidden draw before the first real frame, so nothing compiles mid scroll.
- **Render only when seen:** the home stage starts and stops the loop with an IntersectionObserver; the ambient backdrop stops while the tab is hidden.
- **Ambient backdrop built when idle:** `ambient-backdrop.jsx` waits for `requestIdleCallback` (700 ms timeout) so a page switch paints first.
- **Loader lifts late enough:** after the first 3D frame, `document.fonts.ready`, then two more animation frames, so nothing pops in after the screen lifts (`story-stage.jsx`).
- **Scroll never re-renders React:** the scroll handler writes CSS variables (`--story`, `--fill`); React state only changes when the active chapter changes.
- **Fallbacks:** `prefers-reduced-motion` or no WebGL (`canAnimate` in `support.js`) skip the 3D and keep the still backdrop.

Measured on the home page at 10x CPU, before and after the `forceSinglePass` fix: long tasks during scroll 17 to 6, frames over 50 ms 12 to 5, p95 frame 33 ms to 16.8 ms. At 4x and 6x the scroll holds a 60fps median.

Swiping the moment the loader lifts, before and after the compact honeycomb mask: at 4x CPU a 183 to 217 ms freeze plus 6 to 7 frames over 50 ms became at most one 50 ms frame; at 6x the worst freeze went from 383 ms to 117 ms.

## How to test on slow devices

**Setup.** Puppeteer (`puppeteer-core`, installed at `/tmp/claude-501/lh/node_modules`) driving Brave headless:
- Binary: `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`
- Args: `--enable-gpu --use-angle=metal --ignore-gpu-blocklist` (a real GPU; software rendering misleads)
- Phone emulation: 412 x 915 at DPR 2.625, touch on
- CPU throttling through CDP `Emulation.setCPUThrottlingRate`: 4x (Pixel 10a class), 6x (budget Android), 10x (very old phone). Add network throttling when testing the first load.

**Measure.**
- Time until `.story__stage[data-state]` leaves `loading`.
- Long tasks (`PerformanceObserver` with `longtask`), LCP and CLS.
- rAF frame times during a scripted full page scroll: median, p95, and the count of frames over 33 ms and over 50 ms.
- Also start swiping the instant the loader lifts (watch for `data-loaded` on `<html>` or `data-state="live"`) and log slow frames for the first few seconds. Lag felt "sometimes" usually lives here, not in the long steady scroll.
- When the JS profile is quiet but frames are slow, record a full trace (`page.tracing.start` with the `devtools.timeline` and `blink` categories) and list main thread events over 40 ms. That is how the SVG mask paint (`PaintImage`, `SVGImage::DataChanged`) showed up.

**Find per frame waste.** This is how the pad ring bug was found:
1. In dev only, temporarily expose `{ renderer, scene }` on `window`.
2. Each frame, for every material, compare `renderer.properties.get(material)` (`__version`, `lightsStateVersion`, `currentProgram`) and `material.version` with the previous frame. Anything that changes every frame is a bug.
3. Patch `WebGL2RenderingContext.prototype.linkProgram` and `createProgram` to count calls during the scroll. Any count above zero after warm up means shaders compile mid scroll.
4. Remove the debug hooks afterwards.

**Limitation.** The Mac GPU cannot be throttled, so always finish with a check on a real low end Android phone.

## Mistakes we made (avoid next time)

- **Small or hard shadow maps on phones.** 512 PCF shadows showed as blocky stair steps. Keep 1024 soft shadows.
- **Two separate easings for one move.** The truck accelerated, then jumped. Use one curve per move.
- **Fewer cards with the same timeline.** That squeezed fast beats into half a screen. Remap with `timelineMap` and give big moves more scroll.
- **A loader with a short timeout, shown only on the first visit.** Phones fell through to a still image. Wait for the first frame, on every visit.
- **Infinite CSS animations on many overlay cards.** That caused visible lag. Animate on scroll only.
- **Timing overlays by their own position (`view()`).** Top cards had already left. Use the chapter's named `view-timeline`.

## Testing

- **Measure with a real graphics card:** Playwright headed with `--use-angle=metal`, CPU throttled 4 to 6x, and 4G or slow 3G network. Software rendering (SwiftShader) makes everything look 10x slower and misleads.
- **Time three phases:** time to start the scene code, time to compile and draw the first frame, and time until moving (`data-state="live"`).
- **Check 320 to 1440px** for sideways scroll, and take screenshots of each chapter.
- **Check WebGL off** (patch `getContext` to return null) and reduced motion.

Results here, time until moving:

| Device and network | First visit | Repeat visit |
| --- | --- | --- |
| Mid-range phone, 4G | 3.5 s | 1.1 s |
| Slow phone, slow 3G | 4.5 s | 2.1 s |
| Desktop | | 0.6 s |

## Checklist for the next project

- [ ] Story beats written; timeline steps and `timelineMap` in config
- [ ] Scene behind a strategy interface, lazy loaded
- [ ] Procedural or tiny textures; no big model or image downloads
- [ ] Loader until the first frame; poster captured from the scene; no WebGL and reduced motion fallbacks
- [ ] Easing toward the target; render only when visible and moving; shadow updates gated
- [ ] Adaptive resolution with a sensible floor; antialiasing on; soft shadows at 1024
- [ ] One curve per big move, with enough scroll for it
- [ ] No transparent `DoubleSide` material without `forceSinglePass`; no `needsUpdate` or light toggling per frame
- [ ] Same look on every device (no device gated bloom); glow from additive sprites
- [ ] Too slow safety net hands over to the still backdrop
- [ ] No large animated SVG used as a mask or background; touch screens get a lighter version
- [ ] Measured on a real GPU with throttling (including the per frame material check), plus a real phone
