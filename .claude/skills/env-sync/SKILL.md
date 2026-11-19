---
name: env-sync
description: Keep .env.example, .env.local and .env.production in sync across every package, add missing keys with placeholders, flag keys nothing reads, and make sure an env:check script exists. Use when the user runs /env-sync, adds or removes an env key, or asks to check env files.
argument-hint: "[package folder, default: all]"
---

# /env-sync

## 1. Find env files
Every folder with its own env (`./`, `client/`, `server/`, `scripts/*`). Each must have `.env.example`, `.env.local`, `.env.production`.

## 2. Compare keys only
- Read **key names only**. Never print, paste or log values from `.env.local` or `.env.production`.
- Build a table: key · in example · in local · in production · read by code (grep `configs/env.js`, `configs/public.js`, `process.env`, `import.meta.env`).

## 3. Fix
- Missing file: create it from `.env.example` with placeholder values.
- Missing key: add it to the file with a placeholder and a short comment in `.env.example`.
- Keys nothing reads: list them as numbered yes/no items. Don't remove without a yes.
- Keys the code reads but no file has: add them to all three.
- Check `.gitignore` lists `.env.local` and `.env.production`.
- Flag (without showing values) anything that looks like a live key in `.env.local` or a test key in `.env.production` (e.g. `sk_test_` vs `sk_live_`).

## 4. Guard script
If `npm run env:check` is missing, add `scripts/env-check.mjs` (fails with the list of missing keys per file) and the npm script.

## 5. Report
- Keys added, per file
- Keys to remove (numbered, awaiting yes/no)
- **Host update needed:** which `.env.production` keys must be set on Vercel, the server or CI

End with a suggested commit message.
