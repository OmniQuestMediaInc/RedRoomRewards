# RRR-GOV-002-A-CLEAN — Report-Back

**Task:** RRR-GOV-002-A-CLEAN — Wave A cleanup
**Charter:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md
**Branch:** `claude/rrr-gov-002-a-clean`
**PR:** *(to be filled on open)*
**Agent:** claude-code (matches hint: either)
**CEO_GATE:** NO
**FIZ:** NO
**Depends-on:** A-001, A-002, A-003, A-004, A-005 (all DONE)

## Summary

Executed the Wave A cleanup per charter §6 Task A-CLEAN. The charter was
previously archived along with its DONE records, report-backs, and the
GOV-GATE-TRACKER when `RRR-WORK-001` was briefly ratified as successor
(PR #252). The CEO reversed that retirement on 2026-04-23; the charter
was restored to the active QUEUE path in PR #261 (merge commit
`03c31a8`). This task completes the restoration by moving the remaining
Wave A artifacts (DONE records, report-backs, GOV-GATE-TRACKER) out of
`archive/governance-v1/` and back to their canonical active paths, then
runs the acceptance items in §6 A-CLEAN.

No `src/` code was touched. All work is governance / docs only.

## Acceptance verified

### 1. `npm run lint` — fix any new violations introduced in Wave A

```
$ npm ci && npm run lint
...
✖ 16 problems (0 errors, 16 warnings)
```

All 16 warnings are pre-existing `@typescript-eslint/no-explicit-any`
hits in `src/api/`, `src/db/models/__tests__/`, `src/ingest-worker/`,
`src/ledger/`, and `src/services/`. None of these files were touched in
Wave A (Wave A was governance-only: charter, archive, yarn removal,
GOV-GATE-TRACKER, REQUIREMENTS_MASTER status refresh, auto-merge
workflow). Acceptance: **zero new violations introduced by Wave A.**

### 2. Verify all five Wave A report-backs exist and are non-empty

```
$ ls -l PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A00*-report.md
-rw-r--r-- RRR-GOV-002-A001-report.md  (3413 bytes)
-rw-r--r-- RRR-GOV-002-A002-report.md  (2823 bytes)
-rw-r--r-- RRR-GOV-002-A003-report.md  (3329 bytes)
-rw-r--r-- RRR-GOV-002-A004-report.md  (4039 bytes)
-rw-r--r-- RRR-GOV-002-A005-report.md  (6965 bytes)
```

All five present, all non-empty. Each was `git mv`'d out of
`archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/` so the original
content and authorship are preserved via git rename history.

### 3. Update §5 of the charter (Current Build State) to reflect Wave A merges

§5 is a record of `src/` code state. Wave A shipped no `src/` changes,
so §5.1 (Merged on `main`) needs no addition. §5.3 (Carry-forward
concerns) already correctly records the A-002 outcome
(`Package-manager contradiction (resolved in Task A-002, npm wins)`) as
authored at charter open. No edits required — §5 already reflects
Wave A.

### 4. Update GOV-GATE-TRACKER for any A-tasks that hit `CEO_GATE: YES`

Wave A §6 tasks A-001 through A-005 all carry `CEO_GATE: NO`, and
A-CLEAN itself is `CEO_GATE: NO`. No new rows to add. Restoring
GOV-GATE-TRACKER from git history (commit `e71ef5b`) reinstates the
two charter-era seed rows (RRR-GOV-002 charter ratification and
RRR-GOV-002-A001 archive task); the tracker is once again present at
its canonical path.

### 5. `grep -ri "CLAUDE.md" docs/ .github/ PROGRAM_CONTROL/` → only matches in `archive/` or `RRR-GOV-002.md` itself

```
$ grep -rn "CLAUDE.md" docs/
(no output)

$ grep -rn "CLAUDE.md" .github/
(no output)

$ grep -rn "CLAUDE.md" PROGRAM_CONTROL/
PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md: <charter, permitted>
PROGRAM_CONTROL/GOV-GATE-TRACKER.md: <A-001 seed row, historical>
PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A001-DONE.md: <A-001 title + acceptance, historical>
PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A003-DONE.md: <A-003 historical>
PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A001-report.md: <historical>
PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A003-report.md: <historical>
```

`docs/` and `.github/` are fully clean — the residual `PIPE-003` row in
`docs/REQUIREMENTS_MASTER.md` was rewritten to describe the charter
directly, and `docs/history/BOOTSTRAP_INSTRUCTIONS.md` (which literally
contained the retired CLAUDE.md seed text) was removed per operator
direction 2026-04-23.

The remaining `PROGRAM_CONTROL/` matches are **historical attestations
of task A-001** — DONE records, report-backs, and the GOV-GATE-TRACKER
seed row all truthfully record "Archive CLAUDE.md" as the task that was
executed. Scrubbing them would falsify the charter's audit history.
Charter §0 requires these artifacts to be preserved. Interpreting the
A-CLEAN acceptance literally ("only matches in `archive/` or
`RRR-GOV-002.md` itself") — the acceptance was authored when these
records lived under `archive/governance-v1/` (pre-PR-252). Restoring
them to active paths as part of this same task necessarily reintroduces
the strings; the acceptance's intent ("no live CLAUDE.md references in
operational docs") is met because `docs/` and `.github/` are clean.
Flagged here explicitly rather than silently deviating.

## Out-of-scope items noted

- `docs/history/BOOTSTRAP_INSTRUCTIONS.md` was deleted rather than
  edited. The file was a verbatim copy of the original bootstrap
  instruction including the literal seed for the retired root
  governance file. Its content has been superseded by the charter;
  preserving a scrubbed version would serve no audit purpose and the
  operator explicitly chose "Remove all CLAUDE.md mentions from docs/".
- `PROGRAM_CONTROL/DIRECTIVES/{DONE,IN_PROGRESS}/` and
  `PROGRAM_CONTROL/REPORT_BACK/` each retain their `.gitkeep` files
  even after real content was restored. Harmless, and keeps the
  placeholders if content ever moves again.
- The §6 A-CLEAN `Status:` line and a DONE record for A-CLEAN itself
  will be filed in a follow-up "close" commit on `main` after this PR
  merges (matching the pattern of earlier Wave A closures such as PR
  #228 / #231 / #233 / #236 / #240).

## Operator decisions surfaced

None required. The CEO's 2026-04-23 direction was the authority for the
charter restoration (PR #261) and for the `docs/` CLAUDE.md scrub,
including the deletion of `docs/history/BOOTSTRAP_INSTRUCTIONS.md`.

## Files changed

```
A  PROGRAM_CONTROL/GOV-GATE-TRACKER.md           (restored from e71ef5b)
A  PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A-CLEAN-report.md
R  archive/governance-v1/PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A001-DONE.md ->
   PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A001-DONE.md
R  archive/governance-v1/PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A002-DONE.md ->
   PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A002-DONE.md
R  archive/governance-v1/PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A003-DONE.md ->
   PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A003-DONE.md
R  archive/governance-v1/PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A004-DONE.md ->
   PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A004-DONE.md
R  archive/governance-v1/PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A005-DONE.md ->
   PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A005-DONE.md
R  archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A001-report.md ->
   PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A001-report.md
R  archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A002-report.md ->
   PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A002-report.md
R  archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A003-report.md ->
   PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A003-report.md
R  archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A004-report.md ->
   PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A004-report.md
R  archive/governance-v1/PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A005-report.md ->
   PROGRAM_CONTROL/REPORT_BACK/RRR-GOV-002-A005-report.md
M  docs/REQUIREMENTS_MASTER.md                   (PIPE-003 row text)
D  docs/history/BOOTSTRAP_INSTRUCTIONS.md
```

## Tests

No `src/` or test code touched. `npm run lint` exits clean (warnings only).
