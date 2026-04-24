# RedRoomRewards — Production Schedule

# OmniQuestMediaInc/RedRoomRewards

# Updated: 2026-04-22

# Owner: Kevin B. Hartley, CEO

#

# AGENT RULES (read first, always):

# - Everything on this list is PRE-APPROVED. Execute without asking.

# - No CEO gate. No PR review required. Auto-merge when CI passes.

# - Claude Code is the primary coder. GitHub Copilot handles file ops, cleanup, audits only.

# - On task completion: update Status to DONE, add Merge SHA, move on.

# - Do not ask clarifying questions about tasks already described here.

# - If genuinely blocked on a missing file or broken dep: note it inline and move to next task.

# - Repo is private. Use the PAT already configured in repo secrets.

# - Alert Kevin when context is at 25% or less.

---

## WAVE A — Cleanup (unblocked, execute in parallel)

| ID      | Task                                                                                                                                                                                                                                                                                                                                                                                              | Status | Merge SHA |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----- | :-------- |
| A-003   | Charter-integrity CI check — `scripts/ci/charter-integrity-check.js` parses RRR-WORK-001.md, asserts every DONE task has a matching DONE record with valid Merge SHA; wired into `ci.yml`                                                                                                                                                                                                         | DONE   | 90bcdab   |
| A-004   | Delete `api/src/modules/` dead NestJS tree — `git rm -r api/src/modules/`; grep `src/` for any cross-references and remove them                                                                                                                                                                                                                                                                   | DONE   | 778df64   |
| A-005   | Delete `.github/workflows/directive-intake.yml` and `.github/workflows/directive-dispatch.yml`; confirm no other workflow references them                                                                                                                                                                                                                                                         | DONE   | 90bcdab   |
| A-006   | Consolidate Copilot-governance docs — collapse `COPILOT_INSTRUCTIONS.md` (root) + `docs/governance/COPILOT_GOVERNANCE.md` into `.github/copilot-instructions.md`; rename `COPILOT_EXECUTION_RULES.md` → `docs/governance/AGENT_EXECUTION_RULES.md`; move `docs/copilot/COPILOT.md` → `docs/specs/CHIP_MENU_TOKEN_SYSTEMS_v1.0.md`; archive originals to `docs/history/`; fix all cross-references | DONE   | 778df64   |
| A-008   | Duplicate-file cleanup — archive `docs/work-orders/WORK_ORDER_82B.md` + `docs/WORK_ORDER_82B_82C_ADDENDUM.md` to `docs/history/`; consolidate `src/admin-ops/` stub into `src/services/admin-ops.service.ts`; move `validate-schema.js` to `scripts/`; archive `docs/RISKY_NAME_CHANGE_TAGS.md` to `docs/history/`; delete `console.error` in `src/api/receipt-endpoint.example.ts`               | DONE   | 778df64   |
| A-009   | Remove duplicate CodeQL workflow — diff `.github/workflows/codeql-analysis.yml` vs `.github/workflows/CodeQL Code Scanning.yml`; delete the redundant one (prefer deleting the space-in-filename one)                                                                                                                                                                                             | DONE   | 90bcdab   |
| A-010   | Add husky + lint-staged — pre-commit runs `eslint --fix` + `prettier --write` on staged `.ts`; add `prepare` script to `package.json`                                                                                                                                                                                                                                                             | DONE   | 778df64   |
| A-011   | Switch `ci.yml` “Test” step from `npm test` → `npm run test:ci` (includes `--coverage`); set Jest 80% coverage threshold in `jest.config.js`; if currently below 80% document the gap and set floor                                                                                                                                                                                               | DONE   | 778df64   |
| A-007   | CLEANUP.md audit — grep `src/` for residual legacy imports (Media, Social, Commerce, Discovery sections); tick verified-clean boxes; file follow-ups for anything remaining. **Depends on A-004.**                                                                                                                                                                                                | DONE   | 778df64   |
| A-CLEAN | Wave A cleanup — lint pass, doc consistency sweep, update `OQMI_SYSTEM_STATE_RRR.md`, refresh production schedule, declare Wave B open                                                                                                                                                                                                                                                            | QUEUED | —         |

---

## WAVE B — FIZ Wiring + Data Layer (open after A-CLEAN)

| ID      | Task                                                                                                                                                                                                                                                                    | Status | Merge SHA |
| :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :-------- |
| B-001   | **CRITICAL** Wire `WalletController.creditPoints` to `PointAccrualService` — remove fabricated-response stub; call real service; create LedgerEntry; mutate Wallet.balance; idempotency wrapper stays. FIZ commit format.                                               | QUEUED | —         |
| B-002   | **CRITICAL** Wire `WalletController.deductPoints` to `PointRedemptionService` — same pattern as B-001. FIZ commit format.                                                                                                                                               | QUEUED | —         |
| B-003   | Integration tests — credit→GET shows new balance + ledger entry; deduct→GET shows new balance + ledger entry; idempotency replay = single ledger entry; insufficient balance = rejection + no entry. FIZ commit format. **Depends on B-001, B-002.**                    | QUEUED | —         |
| B-004   | `Tenant` + `Merchant` models — Mongoose/TypeScript; `merchant_tier` enum; `phase` 1 or 2; indexes; unit tests                                                                                                                                                           | QUEUED | —         |
| B-005   | `LoyaltyAccount` + `IdentityLink` models — Mongoose/TypeScript; unique constraints; unit tests. **Depends on B-004.**                                                                                                                                                   | QUEUED | —         |
| B-006   | **CRITICAL** Wrap multi-model wallet mutations in `mongoose.startSession` transactions — credit, deduct, escrow hold, escrow release; preserve existing retry logic; update `.env.example` with replica-set note; add rollback test. FIZ commit format.                 | QUEUED | —         |
| B-007   | `MerchantPairConfig` model — effective-dating; unique partial index; 1:1 default; unit tests. **Depends on B-004.**                                                                                                                                                     | QUEUED | —         |
| B-008   | CI guard: no hardcoded balance values in `src/` — grep-based script; wired into `ci.yml`; self-tests with bad fixture. FIZ commit format.                                                                                                                               | QUEUED | —         |
| B-009   | CI guard: `tenant_id` scope on all Model queries in `src/services/`, `src/wallets/`, `src/ledger/` — allowlist file for justified exceptions; baseline violation list in report. **Depends on B-004.**                                                                  | QUEUED | —         |
| B-010   | Extend `IdempotencyService` to redemption, expiration, escrow hold/release; add `idempotency.service.spec.ts`. FIZ commit format.                                                                                                                                       | QUEUED | —         |
| B-011   | Reconciliation job — `ReconciliationService`; `Wallet.balance == sum(PointLot.remaining) == sum(LedgerEntry.delta)`; emit `RECON_MISMATCH` never auto-correct; `npm run reconcile`; admin endpoint behind feature flag. FIZ commit format. **Depends on B-006, B-010.** | QUEUED | —         |
| B-012   | LedgerService invariant tests — append-only reflection check; monotonic sequence; balance projection; non-null correlation_id + reason_code. FIZ commit format.                                                                                                         | QUEUED | —         |
| B-013   | `admin-ops.service.spec.ts` — full coverage of `src/services/admin-ops.service.ts`. **Depends on A-008.**                                                                                                                                                               | QUEUED | —         |
| B-014   | `src/ingest-worker/replay.ts` — replace `any` with `FilterQuery<>`                                                                                                                                                                                                      | QUEUED | —         |
| B-015   | Split `src/wallets/types.ts` + `src/services/types.ts` by concern; update all imports; no shape changes                                                                                                                                                                 | QUEUED | —         |
| B-016   | Replace `any` with `unknown` + narrowing in `ledger.service.ts` + `services/types.ts`. **Depends on B-015.**                                                                                                                                                            | QUEUED | —         |
| B-CLEAN | Wave B cleanup — lint, test triage (8 pre-existing failures), update state file, declare Wave C open                                                                                                                                                                    | QUEUED | —         |

---

## WAVE C — Provisional (drafted after B-CLEAN)

1. Service ↔ Config wiring (PointAccrual ↔ EarnRateConfig; PointRedemption ↔
   TierCapConfig + SpendOrderConfig)
1. Auth / authz / tenant-isolation middleware
1. Webhook receive (GGS-ready) + emit infrastructure
1. Cross-merchant exchange service (uses MerchantPairConfig)
1. Tier evaluation service
1. Settlement service
1. Fraud signal service

---

## INVARIANTS (non-negotiable, always enforced)

- LedgerService is append-only — no update/delete primitives ever
- Every LedgerEntry: non-null `correlation_id` + `reason_code`
- `Wallet.balance == sum(PointLot.remaining) == sum(LedgerEntry.delta)` at all
  times
- No hardcoded balance values in `src/` outside test files
- Every Model query in services/wallets/ledger includes `tenant_id` filter
- Multi-model wallet mutations: `mongoose.startSession` transactions only
- `ChatNow.Zone` is the canonical merchant name — `XXXChatNow.com` never appears
- Slot machine mechanics: permanently retired
- FIZ tasks: 4-line commit format, no auto-merge (human-visible, not
  human-blocked)

---

## CEO DECISIONS (locked, do not relitigate)

| ID  | Decision                                                                              |
| :-- | :------------------------------------------------------------------------------------ |
| D1  | Slot machine retired                                                                  |
| D2  | ChatNow.Zone canonical merchant name                                                  |
| D3  | Diamond Concierge zero earn                                                           |
| D4  | Room-Heat Inferno Bonus — `inferno_multiplier` required on EarnRateConfig, no default |
| D5  | GGS deferred — webhook-receive endpoints only                                         |
| B1  | `inferno_multiplier` required, no default                                             |
| B2  | Dual-tier: `merchant_tier` (launch) + `rrr_member_tier` (future, nullable)            |
| B3  | Phase 1 merchants: RedRoomPleasures + Cyrano. Phase 2: ChatNow.Zone                   |
| B4  | Cross-merchant rate 1:1 default via MerchantPairConfig                                |
| B5  | Tier caps: PLATINUM 50 / GOLD 35 / SILVER 20 / MEMBER 10 / GUEST 5                    |
