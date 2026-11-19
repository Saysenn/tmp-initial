---
name: new-feature
description: Scaffold a new feature module that follows the project's architecture (service, repository, actions or routes, schemas, jobs, components, config, API routes, tests). Detects the stack from package.json. Use when the user runs /new-feature or asks to add a new feature, module or section.
argument-hint: "<feature-name> [short description]"
---

# /new-feature

Feature: `$ARGUMENTS`

## 1. Read before writing
- `package.json` to detect the stack (Next.js or React + Node).
- Project rules: `CLAUDE.md`, `.claude/architecture.md`, `.claude/folder-structure.md` (if they exist, they win over this skill).
- One existing feature as the pattern to copy. Reuse its style, helpers and components.
- `components/ui/` so the UI uses existing pieces.

## 2. Plan (show it, short)
- Data: tables, columns, constraints, row level security
- Reads and writes (CQRS light), which ones need transactions or idempotency
- Routes or server actions, added to `configs/api.js` under `/api/v1`
- Config file for the feature's settings, lists and copy
- Pages and states (loading, empty, error, success)

## 3. Scaffold (kebab-case files, plain JS)
**Next.js:** `src/features/<name>/` with `actions.js`, `service.js`, `repository.js` (both `import "server-only"`), `schemas.js`, `jobs.js` if needed, `components/`; page in `src/app/` with `loading.jsx`; schema in `supabase/schema.sql` plus a test in `supabase/tests/`.

**React + Node:** `server/src/modules/<name>/` (`routes.js`, `controller.js`, `service.js`, `repository.js`, `schemas.js`), mounted in `routes.js`; migration in `server/src/db/migrations/`; `shared/schemas/<name>.js`; `client/src/features/<name>/` (`hooks/`, `components/`); lazy route in `router.jsx`; tests in `server/tests/<name>/`.

Both: config in `configs/<name>.js`, API client entries in `lib/api/client.js`, navigation entry, tour steps if it is an admin page.

## 4. Check
- Run lint, build and tests. Run `npm run migrate` only against a local database.
- Report files created, then a suggested commit message (`feat: ...`).
