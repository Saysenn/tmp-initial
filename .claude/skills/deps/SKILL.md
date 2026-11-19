---
name: deps
description: Check npm dependency health across every package. Finds security advisories, outdated and unused packages, duplicates, and packages in the wrong section, then proposes safe upgrades as a numbered yes/no list. Use when the user runs /deps or asks about outdated, vulnerable or unused packages.
argument-hint: "[package folder, default: all workspaces]"
disable-model-invocation: true
---

# /deps

## 1. Collect
For each package (root and workspaces):
- `npm audit --json` (security)
- `npm outdated --json` (patch, minor, major)
- `npx depcheck` or `npx knip --dependencies` (unused and missing)
- Packages in `dependencies` that are dev only (lint, test, types, build tools) and the reverse

## 2. Judge
- **Security:** severity, whether the vulnerable code path is actually used, fix version
- **Patch and minor:** usually safe, group them
- **Major:** read the changelog or migration guide, list the breaking changes that touch this code
- **Unused:** confirm by grepping imports, scripts and config files before calling it unused
- Never touch packages pinned on purpose (check for a comment or a doc note)

## 3. Ask
Numbered list, one line each: package · current → target · why · risk (low / needs code change). User answers per number.

## 4. Apply
- Install approved changes, one group at a time.
- Run build, lint and tests after each group. If something breaks, roll that group back and report it.
- Don't leave stray lockfile changes from rolled back groups.

End with a suggested commit message (`chore(deps): ...`).
