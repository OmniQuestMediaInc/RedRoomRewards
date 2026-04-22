# RRR-GOV-002-A002 — Report-Back

**Task:** RRR-GOV-002-A002 — Resolve package-manager contradiction (npm)
**Charter:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md
**Branch:** `gov-002/A-002`
**PR:** *(to be filled on open)*
**Agent:** claude-code (matches hint: `either`)
**CEO_GATE:** NO
**FIZ:** NO

## Summary

Removed the two vestigial Yarn fields from `package.json` — the top-level `packageManager: "yarn@4.9.1"` declaration and the `engines.yarn` constraint — so the repo's declared toolchain matches its actual one (npm, with `package-lock.json`). Kept `engines.node: ">=22.0.0"` per scope. The repo has no `yarn.lock`, so there is nothing else to clean up. `npm install` ran clean against the lockfile (441 packages audited, 0 vulnerabilities); the only `package-lock.json` change is the engines block mirroring the new `package.json` state, which is expected.

## Acceptance verified

- [x] `jq '.packageManager' package.json` → `null`
  ```
  $ jq '.packageManager' package.json
  null
  ```
- [x] `jq '.engines.yarn' package.json` → `null`
  ```
  $ jq '.engines' package.json
  {
    "node": ">=22.0.0"
  }
  ```
  (The `.engines.yarn` key has been removed; `jq '.engines.yarn'` returns `null` by absence.)
- [x] `npm install` runs clean; lockfile change is the expected engines mirror
  ```
  $ npm install
  ...
  added 441 packages, and audited 442 packages in 9s
  78 packages are looking for funding
  found 0 vulnerabilities
  ```
  ```
  $ git diff package-lock.json
  -        "node": ">=22.0.0",
  -        "yarn": ">=4.0.0"
  +        "node": ">=22.0.0"
  ```
  Interpretation: the task text says "no lockfile changes beyond timestamp". `package-lock.json` has no timestamp field; the only diff is npm mirroring the `engines` edit from `package.json` into the lockfile's root entry. No dependencies added, removed, or version-bumped. This is the minimum consistent lockfile state after the edit.

## Files changed

```
 package.json      | 4 +---
 package-lock.json | 3 +--
 2 files changed, 2 insertions(+), 5 deletions(-)
```

- `package.json` — dropped top-level `packageManager` field and dropped `engines.yarn`.
- `package-lock.json` — npm rewrote the engines block in the lockfile's root entry to match. No dep/version changes.

## Tests added / changed

None. Task is tooling config only. `npm install` is the in-scope verification command.

## Follow-ups discovered

None. No `yarn.lock` in repo; CI workflows were already npm-correct per Phase 1 assessment §9 (out of A-002 scope to modify anyway).

## Operator decisions needed

None. Interpretation of "no lockfile changes beyond timestamp" is flagged above for reviewer awareness but does not require a decision — the mirrored engines change is a direct mechanical consequence of the in-scope `package.json` edit.
