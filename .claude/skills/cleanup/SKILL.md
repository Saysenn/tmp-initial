---
name: cleanup
description: Find stale and unused things in the codebase (orphan files, unused exports, assets, CSS classes, tokens, config entries, env keys, npm dependencies, dead flags, commented-out code, temp and backup files) and propose them as a numbered yes/no list. Deletes only what the user approves. Use when the user runs /cleanup or asks for a cleanup pass.
argument-hint: "[folder to scan, default: whole repo]"
disable-model-invocation: true
---

# /cleanup

Find what is unused, prove it, ask, then remove only what is approved.

## 1. Scan
Scope: `$ARGUMENTS` or the whole repo (skip `node_modules/`, build output, `.git/`).

Look for:
- Files nothing imports (components, hooks, helpers, pages that no route uses)
- Unused exports, CSS classes, design tokens
- Images, fonts and other assets nothing references
- Config entries and env keys nothing reads
- npm dependencies nothing imports (check scripts and config files too)
- Dead feature flags, commented-out code blocks
- Temp, backup and leftover files (`*.bak`, `*.old`, `copy of`, `tmp/`, old logs, scratch scripts)

Use `npx knip` or `npx depcheck` if available, but always confirm by hand.

## 2. Prove it is unused
Before listing anything, search the whole repo for:
- Static and dynamic imports (`import()`, `require`, lazy routes)
- String paths, config lookups, `public/` URLs, CSS `url()`
- npm scripts, CI files, `vercel.json`, framework conventions (Next.js `page.jsx`, `route.js`, `layout.jsx` are used by the framework)

If you cannot be sure, list it under "Unsure" with the reason.

## 3. Ask
A short numbered list, one line each: `path` · why it looks unused · what removing it affects (env key on the host, migration, public URL).

The user answers per number ("1 yes, 2 no") or "all yes" / "all no".

## 4. Remove
- On yes: remove the item plus its references (imports, config, all three env files, `package.json`).
- On no: leave it and don't suggest it again this conversation.
- Then run the build, lint and `npm run env:check` (if present) and report the result.
- Say which values must change on the host if an env key was removed.

End with a suggested commit message (`chore: ...`).
