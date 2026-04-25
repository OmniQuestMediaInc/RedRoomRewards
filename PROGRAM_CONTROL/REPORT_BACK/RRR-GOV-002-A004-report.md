# RRR-GOV-002-A004 — Report-Back

**Task:** RRR-GOV-002-A004 — Refresh REQUIREMENTS_MASTER.md stale statuses
**Charter:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md **Branch:**
`gov-002/A-004` **PR:** _(to be filled on open)_ **Agent:** claude-code (matches
hint: `claude-code`) **CEO_GATE:** NO **FIZ:** NO

## Summary

Brought `docs/REQUIREMENTS_MASTER.md` into alignment with the charter's §5.1
current-build-state by updating four requirement rows (PointLot, five Config
models, RRR-P1-006 rename, RRR-P1-007 slot-machine removal) from
`NEEDS_DIRECTIVE` / `IN_PROGRESS` to `DONE` with the corresponding shipped PR
references in the Notes column. Added a `Last verified:` footer dated 2026-04-21
and citing the Phase 1 assessment (charter §5.1) as the source of truth. The
task text used the word "MERGED" for the target status, but the file's existing
STATUS KEY has no `MERGED` entry — `DONE` is the file-native equivalent ("Code
on main, report-back filed, verified") and is already used for other shipped
rows (e.g. RRR-P0-001); flagged this interpretation here. PR numbers were looked
up in `git log origin/main`, not guessed.

## Acceptance verified

- [x] `grep -E "Missing|IN_PROGRESS" docs/REQUIREMENTS_MASTER.md` for the listed
      items → no matches
  ```
  $ grep -nE "Missing|IN_PROGRESS" docs/REQUIREMENTS_MASTER.md
  18:| IN_PROGRESS | Directive executing — PR open |
  ```
  The only remaining match is line 18 — the STATUS KEY _definition_ row, which
  defines what `IN_PROGRESS` means. It is not a requirement row and is not one
  of the listed items (PointLot, five Config models, RRR-P1-006, RRR-P1-007).
  All four listed rows are now `DONE`.
- [x] Footer present
  ```
  $ grep -n "Last verified" docs/REQUIREMENTS_MASTER.md
  132:**Last verified:** 2026-04-21
  ```

## Row-by-row verification

| ID         | Before                                                           | After                                                                                | PR cited                |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| RRR-P1-001 | `NEEDS_DIRECTIVE` / `—` / "All spec features depend on this"     | `DONE` / `RRR-P1-001` / "Shipped in PR #218 — PointLot model on main"                | #218 (commit `8f214b8`) |
| RRR-P1-003 | `NEEDS_DIRECTIVE` / `—` / "All configurable per merchant"        | `DONE` / `RRR-P1-CFG` / "Shipped in PR #226 — all five config models on main"        | #226 (commit `575d50a`) |
| RRR-P1-006 | `IN_PROGRESS` / `chore/rrr-p1-006` / "CEO Decision D2"           | `DONE` / `RRR-P1-006` / "Shipped in PR #219 — CEO Decision D2"                       | #219 (commit `c414a00`) |
| RRR-P1-007 | `IN_PROGRESS` / `chore/rrr-p1-007` / "CEO Decision D1 — retired" | `DONE` / `RRR-P1-007` / "Shipped in PR #222 — CEO Decision D1, slot machine retired" | #222 (commit `72fcbf8`) |

## Files changed

```
 docs/REQUIREMENTS_MASTER.md | 14 +++++++++-----
 1 file changed, 9 insertions(+), 5 deletions(-)
```

- `docs/REQUIREMENTS_MASTER.md` — four row updates + six-line footer appended.

## Tests added / changed

None. Task is pure documentation update; no `src/` or test files touched. No
build or test invocation required.

## Follow-ups discovered

- **RRR-P0-002** is currently `NEEDS_DIRECTIVE` in REQUIREMENTS_MASTER but is
  listed as shipped in the charter's §5.1 ("Idempotency on credit/deduct
  (RRR-P0-002)"). Updating it was **out of scope** for A-004 (the task listed
  only PointLot, the five Config models, RRR-P1-006, RRR-P1-007). Noting it here
  so either A-CLEAN or a Wave-A-adjacent follow-up can true it up. No action
  taken here.

## Operator decisions needed

- **"MERGED" vs "DONE" status value.** The task scope says "update Status column
  to `MERGED` with PR/commit reference". The existing STATUS KEY (lines 15–24)
  has no `MERGED` entry; it defines `DONE` as "Code on main, report-back filed,
  verified" — the exact semantic the task wants. I used `DONE` to stay
  consistent with the file's existing vocabulary and with other rows already
  marked `DONE` (e.g. RRR-P0-001, RRR-P4-004). If the CEO prefers the literal
  word "MERGED", that would require adding a new entry to the STATUS KEY — which
  was out of scope for A-004. Happy to re-work under A-CLEAN if corrected.
