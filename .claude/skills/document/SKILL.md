---
name: document
description: Clean up project documentation. Removes outdated lines, fixes facts that no longer match the code, merges duplicates, and tightens wording so every doc is current, clean and concise. Use when the user runs /document or asks to tidy, refresh or update docs, READMEs or rule files.
argument-hint: "[file or folder, default: all docs]"
---

# /document

Make every doc true to the current code, then make it short.

## 1. Scope
- Target: `$ARGUMENTS` if given, otherwise every Markdown doc the repo tracks: `README*`, `docs/`, `CHANGELOG*`, `CLAUDE.md`, `.claude/*.md`, package and script READMEs.
- Skip: `node_modules/`, `LICENSE`, generated files, `references/`, anything gitignored.
- List the files you will touch before editing.

## 2. Verify every claim against the code
For each doc, check facts instead of trusting them:
- **Paths and files:** every mentioned file or folder exists (`ls`, `git ls-files`).
- **Commands:** every `npm run x` exists in `package.json`; every CLI flag still exists in the script.
- **Env keys:** every key mentioned is in `.env.example`, and every key in `.env.example` that needs explaining is documented.
- **Config, functions, routes, components:** names still exist (grep the codebase).
- **Versions and stack:** match `package.json` and lockfiles.
- **Links:** relative links and `@file` references resolve; heading anchors exist.
- **Statements of status** ("coming soon", "TODO", "not yet supported", old dates): still true?

## 3. Clean
- Fix a wrong fact when the code shows the right one. Delete it when the thing is gone.
- Remove duplicates across docs: keep one source of truth, link to it from the others.
- Cut filler, repetition, hedging and history ("we used to..."). Keep only what a reader needs now.
- Prefer short lists and tables over paragraphs. One idea per bullet.
- Keep terminology consistent across all docs.
- Keep heading order logical (`#` then `##` then `###`), one `#` per file.
- Merge tiny docs that cover the same topic; flag (don't delete) docs that look fully obsolete.

## 4. Guardrails
- **Rule and instruction files** (`CLAUDE.md`, `.claude/*.md`): fix facts, paths and wording only. Never drop, weaken or change a rule without asking.
- **Unsure?** Flag it in the report instead of deleting.
- Don't invent features, commands or behavior. Docs describe what the code does.
- Never delete a whole doc without a yes from the user.

## 5. Report
Short list, per file:
- **Fixed:** facts corrected
- **Removed:** outdated or duplicate lines
- **Flagged:** things you could not verify, as numbered items the user can answer yes or no

End with a suggested commit message (`docs: ...`).
