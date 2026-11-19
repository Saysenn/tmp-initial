---
name: rules-check
description: Audit code against the project's own rules in CLAUDE.md and .claude/*.md (hardcoded values, raw API strings, env reads outside config, dashes in copy, hex colors, cross-feature imports, missing UI states, TypeScript files, wrong file names). Use when the user runs /rules-check or asks whether code follows the project rules.
argument-hint: "[folder or 'diff', default: diff]"
---

# /rules-check

## 1. Load the rules
Read `CLAUDE.md` and every rule file it references. The rules in those files are the checklist; the list below is only a starting point.

## 2. Scope
`$ARGUMENTS`: a folder, `all`, or `diff` (default: files changed vs `main` plus uncommitted).

## 3. Common checks (grep, then read to confirm)
- **Hardcoded copy, colors, URLs, limits** inside components (`#[0-9a-f]{3,6}`, user-facing strings in JSX)
- **Raw API paths:** `"/api/` outside `configs/api.js`; `fetch(` outside `lib/api/http.js`
- **Env reads** (`process.env`, `import.meta.env`) outside the env config file
- **Third party SDK imports** outside `lib/` adapters or `providers/` / `strategies/`
- **Cross feature imports** of components or helpers (only `service.js` / `repository.js` allowed)
- **Queries in services or actions**, business logic in controllers or actions
- **Dashes** (`-`, `–`, `—`) as punctuation in visible copy and config text
- **Files:** `.ts`/`.tsx`, non kebab-case names
- **UI:** data components missing loading, empty or error states; toasts not using `lib/toast.js`; inline markup that duplicates a `components/ui/` piece
- **Data:** multi-step writes without a transaction; read-modify-write on counters; payment or order writes without idempotency
- **Motion:** hardcoded durations or easings, animating layout properties

## 4. Report
Group by rule: `file:line` · what is wrong · fix. Most serious first. Ask before fixing more than a handful; fix the obvious ones if the user says go. End with a suggested commit message if anything changed.
