STATUS: COMPLETE
DIRECTIVE: RRR-BOOTSTRAP-001
DATE: 2026-04-17
AGENT: CLAUDE_CODE
PR_NUMBER: pending
BRANCH: claude/program-control-bootstrap-mITKg
FILES_CHANGED:
  .github/pull_request_template.md
  CONTRIBUTING.md
  api/src/modules/ledger/guards/idempotency.guard.ts
  eslint.config.mjs
  package.json
  PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/RRR-BOOTSTRAP-001.md (moved from QUEUE)
  PROGRAM_CONTROL/REPORT_BACK/RRR-BOOTSTRAP-001-report.md

LINT_OUTPUT:
  npm run lint exit: 0
  Final result: 125 problems (0 errors, 125 warnings)
  All warnings are pre-existing @typescript-eslint/no-explicit-any and
  @typescript-eslint/no-unused-vars warnings in src/ and api/src/ — they are
  non-fatal and were configured as warnings (not errors) in eslint.config.mjs
  per directive.

TSC_OUTPUT:
  npx tsc --noEmit exit: 1
  tsconfig.json(13,25): error TS5107: Option 'moduleResolution=node10' is
  deprecated and will stop functioning in TypeScript 7.0. Specify
  compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
  STATUS: PRE-EXISTING — present on origin/main before this directive.
  Not introduced by this PR. Out of scope — this directive touches no
  TypeScript source under src/.

VIOLATIONS_FIXED: 6
  - 1 MD041 (pull_request_template.md: H1 first heading)
  - 3 MD040 (CONTRIBUTING.md: missing language tags on fenced code blocks
    at lines 208, 216, 350)
  - 2 MD034 (CONTRIBUTING.md: bare email addresses on lines 521 and 549)
  - 1 Table pipe alignment (CONTRIBUTING.md: commit prefix enum table)
  - 1 ESLint error: @typescript-eslint/no-unsafe-function-type
    (api/src/modules/ledger/guards/idempotency.guard.ts:141 — replaced bare
    `Function` type with `(...args: unknown[]) => unknown`)

TEST_RESULTS: UNCHANGED
  Baseline before changes: 7 test suites failed, 9 tests failed, 168 passed.
  Baseline after changes:  7 test suites failed, 9 tests failed, 168 passed.
  No new test failures introduced. Pre-existing failures include MongoDB
  replica-set / transaction-dependent specs in wallet.service concurrency
  tests (timeouts) — unrelated to this directive.

NOTES: >
  All four directive steps executed exactly as specified.

  Step 1 — Markdownlint fixes applied to .github/pull_request_template.md
  (H1 `# Summary`) and CONTRIBUTING.md (language tags on three bare fences,
  angle-bracket wrapping on two bare emails, re-aligned commit prefix
  enum table to uniform column widths).

  Step 2 — eslint.config.mjs created verbatim per directive content.
  package.json lint script patched from `eslint . --ext .ts` to `eslint .`.
  Initial lint run surfaced one error outside src/ in
  api/src/modules/ledger/guards/idempotency.guard.ts at line 141 — the bare
  `Function` type flagged by @typescript-eslint/no-unsafe-function-type.
  The file is under api/src/ (not the repo-root src/) so the src/ exclusion
  did not apply. Replaced bare `Function` with the specific callable type
  `(...args: unknown[]) => unknown` — a type-only change, no logic change.
  Final lint exits 0 with 0 errors and 125 warnings (all warnings
  pre-existing any-typed parameters and unused vars).

  Step 3 — All five .gitkeep placeholders already present under
  PROGRAM_CONTROL/ from prior bootstrap work. No new placeholder creation
  was required.

  Step 4 — CLAUDE.md already present at repo root in its authoritative
  form (created by the prior bootstrap run). No change.

  npm install required --legacy-peer-deps because root typescript@^6.0.3
  conflicts with @typescript-eslint peer range (>=4.8.4 <6.1.0) and
  ts-jest peer range (>=4.3 <6). This is a pre-existing dependency graph
  issue on main, unrelated to this directive.

  No files under repo-root src/ were touched. FIZ: NO — no financial
  logic modified. Directive file moved QUEUE → IN_PROGRESS via git mv
  at the start of work; will be moved IN_PROGRESS → DONE after PR merges.
