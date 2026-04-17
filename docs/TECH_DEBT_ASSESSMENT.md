# Tech Debt Assessment — RedRoomRewards

**Date**: 2026-04-17
**Branch**: `claude/audit-tech-debt-assessment-074Tx`
**Scope**: Full-repo audit of source, config, tests, CI, docs, and infra.

## Executive summary

RedRoomRewards has a solid architectural foundation — strict TypeScript, an
immutable ledger, event-driven ingestion, explicit service boundaries — but
carries meaningful debt in four areas that block a clean production cutover:

1. Wallet writes are not transaction-safe (multi-model updates use optimistic
   locking, not MongoDB sessions).
2. Idempotency is explicitly unimplemented in the wallet controller's
   credit/deduct paths.
3. CI does not lint or type-check TypeScript; `src/` is excluded from the
   only lint workflow.
4. Documentation has sprawled to 28 root markdown files with heavy overlap,
   making the source of truth hard to locate.

Test coverage, config completeness (no Prettier config, no pre-commit hooks),
and infra scaffolding (no Docker/Terraform/K8s) are secondary but material.

## Findings by severity

### Critical — fix before any production cutover

**C1. Wallet operations are not transaction-safe**
- `src/wallets/wallet.service.ts:7-28` — file-level comment acknowledges that
  multi-model updates (wallet + escrow + ledger) rely on optimistic locking
  with rollback attempts rather than MongoDB sessions, and explicitly defers
  the fix with an example pattern.
- Risk: partial writes under concurrent load; ledger/wallet divergence.
- Action: wrap wallet mutations in `mongoose.startSession()` + transactions
  as the header comment already sketches.

**C2. Idempotency not enforced on wallet credit/deduct**
- `src/api/wallet.controller.ts:131` and `src/api/wallet.controller.ts:186`
  contain `// TODO: Check idempotency` with stubbed logic. The handlers
  return placeholder balances (`const previousBalance = 1000;` at line 141).
- Risk: duplicate transactions on retries; financial correctness.
- Action: inject `ILedgerService`, call `checkIdempotency` on the supplied
  `idempotencyKey` before mutation, return cached result on hit.

**C3. CI does not lint or type-check TypeScript**
- `.github/workflows/lint.yml:36-47` runs Super-Linter with
  `VALIDATE_YAML/JSON/MARKDOWN` only, and `FILTER_REGEX_INCLUDE` explicitly
  excludes `src/`, `api/`, `infra/`, `archive/`.
- `package.json:13` defines an `eslint . --ext .ts` script but it is never
  invoked in CI.
- No `test` or `build` workflow exists under `.github/workflows/` — only
  `lint.yml` and `codeql-analysis.yml`.
- Action: add a workflow that runs `npm run lint`, `tsc --noEmit`, and
  `npm run test:ci` on PRs.

**C4. Untyped query construction in replay path**
- `src/ingest-worker/replay.ts:36` — `const query: any = {}`. Current callers
  appear safe, but the pattern is the kind that invites NoSQL injection when
  extended.
- Action: replace `any` with a typed `FilterQuery<…>` from Mongoose.

### High — fix this sprint

**H1. CLEANUP.md checklist is unstarted**
- `CLEANUP.md` lists mandatory removal of legacy social/media/marketplace
  features; checkboxes are all empty and there is no evidence the legacy
  surface has been audited. `archive/xxxchatnow-seed/` still ships in-repo.
- Action: walk the checklist, confirm no residual imports, then either
  delete `archive/` or move it to a separate retention repo.

**H2. Test coverage gaps at the service layer**
- 18 test files vs. 56 source files. Jest is configured with an 80%
  threshold (`jest.config.js`), but several large services have no dedicated
  spec:
  - `src/services/point-accrual.service.ts`
  - `src/services/redemption.service.ts`
  - `src/services/expiration.service.ts`
  - `src/activity-feed/*`
- Action: add unit tests for these services before the 80% threshold is
  enforced on CI.

**H3. Oversized type modules**
- `src/wallets/types.ts` — 568 lines.
- `src/services/types.ts` — 515 lines, mixes domain types with queue
  authorization shapes and service interface contracts.
- Action: split per concern (domain, queue, service-contract).

**H4. No pre-commit enforcement**
- No `.husky/`, no `lint-staged` config, no `.pre-commit-config.yaml`.
  Combined with C3, nothing stops lint/type errors from entering main.
- Action: add `husky` + `lint-staged` running `eslint --fix` and
  `prettier --write` on staged `*.ts`.

### Medium — scheduled cleanup

**M1. Documentation sprawl (28 root markdown files)**
  Clusters of overlap to consolidate:
  - **Security (6 files)** — `SECURITY.md`, `SECURITY_SUMMARY.md`,
    `SECURITY_BEST_PRACTICES.md`, `SECURITY_AUDIT_AND_NO_BACKDOOR_POLICY.md`,
    `SECURITY_REVIEW_IMPLEMENTATION_SUMMARY.md`,
    `COMPREHENSIVE_SECURITY_REVIEW_2026-01-04.md`. Merge into one
    `SECURITY.md` plus a dated `docs/security/` history folder.
  - **Implementation status (4 files)** — `IMPLEMENTATION_SUMMARY.md`,
    `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_NOTES.md`,
    `AUDIT_IMPLEMENTATION_SUMMARY.md`. Keep one live `IMPLEMENTATION_STATUS.md`;
    archive the rest under `docs/history/`.
  - **Copilot governance (4 files)** — `COPILOT_INSTRUCTIONS.md`,
    `COPILOT_GOVERNANCE.md`, `COPILOT_EXECUTION_RULES.md`, and a lowercase
    duplicate `copilot-governance.md`. Collapse to one, delete the duplicate.
  - **Resolution artifacts (3 files)** — `PR81_RESOLUTION.md`,
    `JEST_UPDATE_RESOLUTION.md`, `DEPENDENCY_CONFLICT_RESOLUTION.md`. Move to
    `docs/history/` or delete — they describe finished work.
  - **Roadmap** — `ROADMAP_AND_BACKLOG.md` is 1.5KB and `DECISIONS.md` has
    one entry. Either flesh out or merge.
  Target: ~8 root docs (`README`, `ARCHITECTURE`, `SECURITY`, `CONTRIBUTING`,
  `DECISIONS`, `ROADMAP_AND_BACKLOG`, `CLEANUP`, `LICENSE`).

**M2. Prettier declared but unconfigured**
- `package.json:42` pins `prettier@^3.8.1` and exposes a `format` script, but
  no `.prettierrc` / `.prettierrc.json` exists at the repo root.
- Action: add a `.prettierrc` so `npm run format` produces deterministic output.

**M3. `any` usage in production code (non-test)**
- `src/services/types.ts:338` — `Record<string, any>` in a context object.
- `src/ledger/ledger.service.ts:84, 104, 156, 198` — error/query handling.
- `src/ingest-worker/replay.ts:36` — covered under C4.
- Action: replace with `unknown` + narrowing or typed Mongoose filters.

**M4. `infra/` is scaffolding only**
- `infra/config/README.md`, `infra/db/README.md`, `infra/migrations/README.md`
  contain guidance but no executable artifacts (no Dockerfile, Terraform,
  Helm, migration scripts).
- Action: either land the actual deployment artifacts or remove the
  directory until they exist, so it stops implying readiness.

**M5. Legacy archive in main repo**
- `archive/xxxchatnow-seed/` ships reference data for a legacy integration.
  Not imported by `src/`, but inflates clone size and confuses scope.
- Action: move to a separate retention repo or tarball under `docs/history/`.

### Low — nice-to-have

**L1. Minimal `DECISIONS.md`**
- Single entry dated 2026-01-02. Worth adopting an ADR-style layout
  (`docs/adr/NNNN-title.md`) so decisions accumulate rather than overwrite.

**L2. `console.error` in example file**
- `src/api/receipt-endpoint.example.ts:114`. Example code only, but either
  route through `Logger` or drop the file to avoid copy-paste precedent.

**L3. `STATUS_REPORT.md` (20KB), `FINANCIAL_AUDIT_REPORT.md` (20KB), `SLOT_MACHINE_BRIEFING.md` (23KB)**
- Large reference docs at the root. Move to `docs/` so the repo root stays
  navigable.

## Recommended sequencing

1. **Week 1** — C3, C4, H4 (restore CI guardrails + pre-commit).
2. **Week 2** — C2 (idempotency), then start C1 (wallet transactions).
3. **Week 3** — Finish C1 with integration tests; close H2 service-layer test gaps.
4. **Week 4** — H1 cleanup checklist, M1 doc consolidation, M2 Prettier config.
5. **Backlog** — H3 type splits, M3 `any` cleanup, M4 infra artifacts, L1/L2/L3.

## Metrics baseline (capture before fixes land)

- Source files: 56 (9,952 non-test LOC).
- Test files: 18 (6,613 LOC).
- Jest coverage threshold: 80% branches/functions/lines/statements
  (`jest.config.js`). Actual coverage: unmeasured in CI.
- Root markdown files: 28.
- `any` occurrences in `src/`: ~14 (includes tests).
- Outstanding `TODO`/`FIXME` in `src/`: 2 (both in
  `src/api/wallet.controller.ts`).

Re-measure after each milestone to track debt burn-down.
