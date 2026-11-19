---
name: ui-check
description: Verify a UI change in the real browser. Checks phone, tablet and desktop widths, overflow, light and dark mode, every UI state (loading, empty, error, offline, validation, success), keyboard and screen reader basics, and the project's style rules. Use when the user runs /ui-check or after any UI change.
argument-hint: "[page path or component, default: pages changed in git diff]"
---

# /ui-check

## 1. What to check
- `$ARGUMENTS`, or the pages touched by `git diff` (map changed components to their routes).
- Start the dev server if it is not running. Sign in with the seeded test account if the page needs it (local only).

## 2. In the browser (Claude in Chrome)
For each page, at **375px, 768px and 1280px**, in light and dark mode:
- No horizontal scroll, no clipped or overlapping text, long content wraps or scrolls inside its box.
- Click through the changed flow like a user. Note anything broken.
- Console has no errors or warnings from our code.

## 3. States
Force each one (throttle network, go offline, mock an empty or failing response, submit a bad form):
loading skeleton · empty · error · no internet · slow network · no search results · permission denied · session expired · form validation · success.

## 4. Accessibility
- Tab through: logical order, visible focus, no traps; Escape closes popovers and dialogs.
- Inputs have labels; icon buttons have `aria-label`; one `h1`, headings in order.
- Text and accent pairs meet WCAG AA contrast.
- `prefers-reduced-motion` turns movement into a fade.

## 5. Style rules (if the project has them)
No dashes in visible copy, no thick borders, no glass panels, no hardcoded hex colors, tokens only, motion durations from tokens.

## 6. Report
A short table: page · width · issue · fix. Fix what you can, re-check, then list what is left. Delete screenshots or GIFs you made unless the user wants them.
