# RRR-GOV-002-A001 — Report-Back

**Task:** RRR-GOV-002-A001 — Archive CLAUDE.md **Charter:**
PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md **Branch:** `gov-002/A-001`
**PR:** _(to be filled on open)_ **Agent:** claude-code (matches hint: either)
**CEO_GATE:** YES **FIZ:** NO

## Summary

Moved the root `CLAUDE.md` instruction file to
`archive/governance/CLAUDE_2026-04-21.md` with `git mv` so the rename is
preserved as a single history-tracked operation. Added `archive/README.md`
declaring the archive read-only invariant and naming the active charter as the
current source of truth. Added an `Active Charter:` pointer to
`.github/copilot-instructions.md` so Copilot sessions land on RRR-GOV-002 rather
than the retired file. The pre-existing `.github/copilot-instructions.md` held
no references to the retired filename, so no removals were needed there. An
in-scope root-cause adjustment was required to `.gitignore` — see "Operator
decisions" below.

## Acceptance verified

- [x] `git ls-files CLAUDE.md` → empty
  ```
  $ git ls-files CLAUDE.md
  (no output)
  ```
- [x] `git ls-files archive/governance/CLAUDE_2026-04-21.md` → present
  ```
  $ git ls-files archive/governance/CLAUDE_2026-04-21.md
  archive/governance/CLAUDE_2026-04-21.md
  ```
- [x] `grep -r "CLAUDE.md" .github/` → no results
  ```
  $ grep -rn "CLAUDE.md" .github/
  (no output)
  ```
- [x] `grep -r "RRR-GOV-002" .github/copilot-instructions.md` → at least one
      match
  ```
  $ grep -rn "RRR-GOV-002" .github/copilot-instructions.md
  14:**Active Charter:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md — persistent governance + active work stream (supersedes the retired root governance document, archived at archive/governance/CLAUDE_2026-04-21.md)
  ```

## Files changed

```
 .github/copilot-instructions.md                    |  1 +
 .gitignore                                         |  3 ---
 archive/README.md                                  | 27 ++++++++++++++++++++++
 archive/governance/CLAUDE_2026-04-21.md            |  0
 4 files changed, 28 insertions(+), 3 deletions(-)
```

- `.github/copilot-instructions.md` — added `Active Charter:` line pointing at
  RRR-GOV-002.
- `.gitignore` — removed the `archive/` ignore rule so the archived governance
  file can be tracked (see "Operator decisions").
- `archive/README.md` — new file declaring the archive read-only invariant and
  naming the active charter.
- `CLAUDE.md` → `archive/governance/CLAUDE_2026-04-21.md` — `git mv`, no content
  change.

## Tests added / changed

None. Task is docs/governance only; no `src/` or test files touched.

## Follow-ups discovered

None.

## Operator decisions needed

**Already applied (flagging for visibility):** the repo's existing `.gitignore`
contained an `archive/` rule that would have made the acceptance criterion
`git ls-files archive/governance/CLAUDE_2026-04-21.md` impossible to satisfy.
The charter's §0 persistence model uses `archive/governance/` as the permanent
resting place for retired charters, which is structurally incompatible with an
ignore rule on `archive/`. I removed the ignore rule as an in-scope root-cause
fix for the task (without it, the archive would be untracked and the move would
be invisible to `main`). If the CEO prefers the archive to remain untracked, the
rule can be restored and the task re-scoped; flagging here per the charter's
no-silent-drift posture.
