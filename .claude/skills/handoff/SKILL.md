---
name: handoff
description: Write a short handoff note at the end of a work session (what changed, what works, what is left, decisions made, how to continue) into docs/progress.md so the next session or teammate can pick up instantly. Use when the user runs /handoff, says they are stopping for the day, or asks for a progress summary.
argument-hint: "[topic, optional]"
---

# /handoff

## 1. Gather facts
- `git status`, `git diff --stat`, recent `git log` since the last handoff entry
- This conversation: goals, decisions and the reasons, blockers, anything the user said to do next
- Run build or tests if cheap, so "works" is verified, not assumed

## 2. Write `docs/progress.md`
Newest entry at the top. Keep each entry under about 25 lines:

```md
## YYYY-MM-DD: <topic>
**Done**
- ...
**Works / verified**
- ...
**Left to do**
- [ ] ...
**Decisions**
- <decision>: <why>
**Next step**
- The very first thing to do when resuming
**Host / env changes**
- Keys or settings to update on the host (names only, no values)
```

## 3. Keep it clean
- Move finished "Left to do" items from older entries into that day's "Done", and drop entries older than the last ~10 into `docs/progress-archive.md`.
- No secrets, no values from env files, no personal data.

## 4. Reply
Three lines: what was saved, the next step, and a suggested commit message (`docs: ...`).
