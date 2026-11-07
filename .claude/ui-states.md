# UI State Rules

Every screen must work when things go wrong, not only on the happy path. Design and build all of the states below wherever they can happen. Each state's copy comes from config (see @contents.md), and each is a reusable component in `components/ui/` (for example `empty-state`, `error-banner`, `offline-banner`, `success-panel`).

## 1. Empty state
- Say why it is empty, then give one next step ("Nothing saved yet. Tap the heart on any product and it will show up here." plus "Browse bestsellers").
- One simple illustration or icon, a short heading, one line of help, one primary button.
- Never a blank screen or a bare "No data".

## 2. Loading state
- Use skeletons that match the real layout (cards, rows, headings), not a lone spinner.
- Keep everything already known on screen (header, greeting, filters, nav) and load only the content area.
- No layout shift when the real content replaces the skeleton.

## 3. Error state
- Say what happened in plain words, and what it means for the user ("Your bank declined the card ending 4417. You have not been charged.").
- Show it inline near the problem, keeping the user's data and context on screen.
- Offer a clear way forward: one primary fix ("Try another card") and at most one alternative ("Pay with UPI instead").
- Never show raw error codes or stack traces.

## 4. No internet
- Keep showing cached content instead of a blank error page, and mark it as offline.
- Show a small, non-blocking offline banner, and retry automatically when the connection returns.
- Queue writes made offline where possible, or tell the user clearly that they will not save.

## 5. Slow network
- Show progress (a progress bar or skeletons) and render content as it arrives instead of waiting for everything.
- Load text first and images after, using small placeholder images.
- When loading takes longer than a config time limit, offer a lighter option ("Switch to lite mode") or a retry.

## 6. No search results
- Repeat the query ("No results for 'blu sheos'").
- Suggest a spelling fix ("Did you mean blue shoes?") with a one tap action to search it.
- Show popular searches or categories as chips so the user is never stuck.
- Offer to clear filters when filters caused the empty result.

## 7. Permission denied (camera, location, notifications, files)
- Before asking, explain why the permission is needed.
- When it is denied, explain what will not work, show how to enable it in settings (with a link to settings where the platform allows), and offer an alternative (for example "Upload a photo instead").
- Never show a dead screen, such as a black camera preview with no message.
- For server side permission (403), say the user has no access and who to ask.

## 8. Session expired
- Show a clear message ("You were signed out") in a dialog over the current page, not a sudden redirect.
- Let the user sign in again in place and return to exactly where they were.
- Never lose their work: keep the cart, form input, and drafts through the sign in.

## 9. Form validation
- Validate each field on blur, then live while the user fixes it (debounced). Do not show errors before the user has typed.
- Mark valid fields with a check and invalid fields with an error icon and a message under the field that says how to fix it ("Enter a full email, like name@example.com").
- Never rely on color alone: always pair it with an icon and text, and link the message to the field with `aria-describedby`.
- Keep the submit button disabled until required fields are valid, or on submit move focus to the first error.
- Keep everything the user typed when an error occurs.

## 10. Success state
- Confirm clearly what happened, with the key details (order number, amount, payment method, delivery date, address).
- Give the most useful next step as the primary action ("Track order") and one secondary action ("Continue shopping").
- Use a short, calm success animation that respects `prefers-reduced-motion`. Use a toast for small actions and a full success screen for big ones (orders, payments, sign up).

## Checklist for every data driven screen
Before a screen is done, confirm it handles: empty, loading, error, no internet, slow network, permission denied, session expired, and (where relevant) no search results, form validation, and success.
