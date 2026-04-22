# OQMI SYSTEM STATE — RedRoomRewards

**Document:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE_RRR.md`
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Version:** v1.1 (A-002 ratification — A-001 moved to DONE; charter retirement recorded)
**Last Updated:** 2026-04-21
**Owner:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Governing Document:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`
**Active Charter:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-WORK-001.md`

> Companion to — and deliberately disjoint from — the ChatNowZone–BUILD file at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md`. That file is scoped to a different repo. Do not read across; the two state files are maintained independently.

---

## §0 — PURPOSE

Living state tracker for OmniQuestMediaInc/RedRoomRewards. Answers three questions at any point in time:

1. **DONE** — what has been built and is merged to `main`
2. **WIP** — what is actively in progress, on which branch, by which agent
3. **OUTSTANDING** — what remains, in what priority, with what blockers

This is **not** a doctrine document. Governance rules live in `OQMI_GOVERNANCE.md`; the active task queue with acceptance criteria lives in `RRR-WORK-001.md`. This file mirrors state from those authorities and is rewritten on every merging PR per §8 below.

---

## §1 — REPO ORIENTATION

| Field | Value |
|---|---|
| Repo name | RedRoomRewards |
| Repo URL | https://github.com/OmniQuestMediaInc/RedRoomRewards |
| Default branch | `main` |
| Primary language | TypeScript |
| Package manager | npm (per `.github/copilot-instructions.md §3`; do not introduce Yarn or pnpm) |
| Database | MongoDB (mongoose; replica-set required for transaction-scoped wallet writes — see §5 CRITICAL #3) |
| Active charter | `PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-WORK-001.md` (effective on Task A-002 merge; supersedes `RRR-GOV-002.md`) |
| Governance doctrine | `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` |
| Agent instructions | `.github/copilot-instructions.md` |
| CEO Decisions of record | `docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md` + `RRR-WORK-001.md §4` |
| Canonical merchant name | `ChatNow.Zone` (D2). `XXXChatNow.com` is retired and must not appear in new code. |

---

## §2 — SERVICE INVENTORY (confirmed on `main`, 2026-04-21)

### Present and in use

| Service | Path | Notes |
|---|---|---|
| `LedgerService` | `src/ledger/ledger.service.ts` | Append-only by design; no `update`/`delete` primitives. Invariant test pending (B-012). |
| `WalletService` | `src/wallets/wallet.service.ts` | Optimistic-lock posture. **Atomicity gap** — multi-model mutations do not use `mongoose.startSession` transactions (CRITICAL #3, Task B-006). |
| `EscrowService` | `src/wallets/escrow.service.ts` (or sibling) | Paired with wallet flows. |
| `PointAccrualService` | `src/services/…` | Present, but **not yet wired** from `WalletController.creditPoints` (CRITICAL #2, Task B-001). Config wiring to `EarnRateConfig` pending. |
| `PointRedemptionService` | `src/services/…` | Present, but **not yet wired** from `WalletController.deductPoints` (CRITICAL #2, Task B-002). Config wiring to `TierCapConfig` + `SpendOrderConfig` pending. |
| `PointExpirationService` | `src/services/…` | Present; config wiring to `SpendOrderConfig` pending. |
| `IdempotencyService` | (service layer) | Wrapper landed on credit/deduct (RRR-P0-002). Underlying mutation is absent — wrapper fronts a no-op controller (see CRITICAL #2). |
| `WalletController` | `src/wallets/wallet.controller.ts` | **FLAGGED:** `creditPoints`/`deductPoints` return fabricated responses without invoking the real services or writing to the ledger. Closes on B-001/B-002/B-003. |

### Data models confirmed on `main`

Wallet, ModelWallet, EscrowItem, LedgerEntry, Idempotency, PointLot, plus the five Config models (ValuationConfig, EarnRateConfig, TierCapConfig, MicroTopupConfig, SpendOrderConfig).

### Missing / not yet built

- `Tenant`, `Merchant`, `LoyaltyAccount`, `IdentityLink`, `MerchantPairConfig` models (Wave B identity/tenancy layer)
- `ReconciliationService` (Task B-011 — gated on CRITICAL #2 wiring and CRITICAL #3 atomicity)
- `SettlementService`, `TierEvaluationService`, `FraudSignalService`
- Auth / authz / tenant-isolation middleware (Wave C)
- Webhook receive (D5: GGS-ready) and emit infrastructure (Wave C)

---

## §3 — DONE

Merged on `main` and verified as of 2026-04-21. Mirrors `RRR-WORK-001.md §5.1`. Reverse-chronological by wave; within a wave, by task ID.

### RRR-WORK-001 Wave A — opening bundle

- RRR-WORK-001-A001 — `OQMI_SYSTEM_STATE_RRR.md` installed (PR #244, merge SHA `231665d`)
- RRR-WORK-001-A002 — charter ratified; RRR-GOV-002 retired to `archive/governance/RRR-GOV-002_2026-04-21.md`; `.github/copilot-instructions.md` active-charter reference swapped to RRR-WORK-001; `PROGRAM_CONTROL/HANDOFFS/` installed with thread-06 handoff; `docs/TECH_DEBT_ASSESSMENT.md` archived to `docs/history/TECH_DEBT_ASSESSMENT_2026-04-21.md` *(merge SHA backfilled by A-003 or next PR)*

### RRR-GOV-002 Wave A (governance scaffolding — all DONE on `main`)

- A-001 through A-005 — DONE records present at `PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-GOV-002-A00{1..5}-DONE.md`
- `OQMI_GOVERNANCE.md` v1.0 installed at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`
- Auto-merge hardened against `fiz` and `ceo-gate` labels (A-005, PR #237 + #238)

### Repo bootstrap + cleanup

- PROGRAM_CONTROL scaffolding + CI workflows (RRR-BOOTSTRAP-001, RRR-GOV-001)
- Repo-wide rename `XXXChatNow.com` → `ChatNow.Zone` (RRR-P1-006)
- Slot machine mechanics + seed data removed permanently (RRR-P1-007, D1)

### FIZ scaffolding (partial — see §5 CRITICAL findings for gaps)

- Wallet, ModelWallet, EscrowItem, LedgerEntry, Idempotency models
- PointLot model (RRR-P1-001, PR #218)
- Five Config models — ValuationConfig, EarnRateConfig, TierCapConfig, MicroTopupConfig, SpendOrderConfig (RRR-P1-CFG, PR #226)
- LedgerService (append-only)
- WalletService — partial; optimistic-lock posture only (atomicity gap open, CRITICAL #3)
- EscrowService
- PointAccrualService, PointRedemptionService, PointExpirationService — partial; no config wiring
- WalletController real-balance wiring (RRR-P0-001)
- Idempotency wrapper on credit/deduct (RRR-P0-002) — **wrapper present; underlying mutation absent** (see CRITICAL #2)

---

## §4 — WIP

Current in-progress work, by branch and agent.

| Task | Charter | Branch | Agent | Status |
|---|---|---|---|---|
| RRR-WORK-001-A002 — Charter ratification + RRR-GOV-002 retirement | RRR-WORK-001 | `claude/ratify-rrr-work-001-X2ump` | claude-code | PR open |

Wave A tasks A-003 through A-011 are **unblocked on A-002 merge** and may be claimed in parallel (A-007 further depends on A-004). A-CLEAN depends on all preceding Wave A tasks. See `RRR-WORK-001.md §6` for the full task stream with acceptance criteria.

---

## §5 — OUTSTANDING

Mirrors `RRR-WORK-001.md §5.2`–`§5.3`.

### §5.1 Critical findings (must close before further FIZ work)

- **CRITICAL #1 — Dead NestJS tree `api/src/modules/`.** ~9,500 bytes of inert loyalty-points + ledger middleware; outside `tsconfig.json` compilation roots; never run under Jest. Creates phantom "we already have X" signals. Closes in Task A-004.
- **CRITICAL #2 — `WalletController.creditPoints` and `.deductPoints` are no-ops returning fabricated responses.** Both endpoints run idempotency checks, compute `newBalance = previousBalance ± amount` locally, cache that response, and return it — without ever invoking `PointAccrualService`, `PointRedemptionService`, or writing a `LedgerEntry`. Controller docstring confirms placeholder status. Closes in Tasks B-001, B-002, B-003.
- **CRITICAL #3 — Wallet writes lack MongoDB transaction atomicity.** Multi-model mutations rely on optimistic-lock retries, not `mongoose.startSession` transactions. Must close before the reconciliation job (B-011) ships, or recon will reliably find drift it didn't cause. Closes in Task B-006.

### §5.2 Known-missing (drives Wave B backlog)

- `Tenant`, `Merchant`, `LoyaltyAccount`, `IdentityLink`, `MerchantPairConfig` models
- Service-to-config wiring: accrual ↔ EarnRateConfig; redemption ↔ TierCapConfig + SpendOrderConfig; expiration ↔ SpendOrderConfig
- Auth / authz / tenant-isolation middleware (Wave C)
- Webhook receive (D5 GGS-ready) + emit infrastructure (Wave C)
- Reconciliation job, settlement service, tier evaluation service, fraud signal service
- Idempotency coverage beyond credit/deduct
- CI guards: hardcoded-balance, `tenant_id` scope
- LedgerService invariant tests

### §5.3 Carry-forward concerns

- 8 pre-existing test failures (triaged in Wave B cleanup, Task B-CLEAN)
- `infra/` is README-only scaffolding; ship-vs-delete pending CEO deploy-target decision (W4)
- RRR-GOV-002 §10 changelog gap: PR #235 amended §3.5 item 18 (CEO_GATE removal) without appending a §10 row. Backfill is an A-CLEAN concern.

---

## §6 — BLOCKERS

Items that block forward motion on this repo.

| ID | Blocker | Blocks | Resolution path |
|---|---|---|---|
| CRITICAL #1 | Dead `api/src/modules/` tree creates false "already built" signals | Any Wave B work touching idempotency, webhooks, or ledger controllers | Task A-004 (delete outright) |
| CRITICAL #2 | `WalletController` credit/deduct return fabricated responses; no service call, no ledger entry | All downstream FIZ work (reconciliation, settlement, tier evaluation) | Tasks B-001, B-002, B-003 |
| CRITICAL #3 | Wallet multi-model writes are not transactional | Reconciliation job (B-011) — recon will falsely flag drift until atomicity is closed | Task B-006 (requires MongoDB replica-set; `.env.example` to declare `MONGO_URI` with `?replicaSet=`) |
| W4 | `infra/` ship-vs-delete pending CEO deploy-target decision | Any production deploy work | CEO decision (out of scope for this charter) |

---

## §7 — RETIRED

Decisions and artifacts locked as permanently retired. Do not reintroduce.

- **D1 — Slot machine mechanics and seed data.** Permanently retired. No reintroduction in any form (RRR-P1-007 shipped the removal).
- **D2 — `XXXChatNow.com` naming.** Retired in favor of `ChatNow.Zone` as the canonical merchant name (RRR-P1-006 shipped the rename). Must not appear in new code, comments, or documents.
- **Root `CLAUDE.md`.** Retired; archived at `archive/governance/CLAUDE_2026-04-21.md`. The active agent-instructions file is `.github/copilot-instructions.md`.
- **Directive workflow automation** — `.github/workflows/directive-intake.yml` and `.github/workflows/directive-dispatch.yml`. Deletion pending in Task A-005 (per CEO Decision W1: agents own the full lifecycle in their final commit; no workflow automation).
- **`CEO_GATE` field on directives.** Retired in favor of `OQMI_GOVERNANCE.md §2.2` Human-Review Categories. Historic references remain in archived governance docs.
- **`RRR-GOV-002.md`** — retired on A-002 merge; archived at `archive/governance/RRR-GOV-002_2026-04-21.md`. Replaced as the active charter by `RRR-WORK-001.md`.
- **Thread #5 tech-debt assessment** (root `docs/TECH_DEBT_ASSESSMENT.md`) — archived on A-002 merge to `docs/history/TECH_DEBT_ASSESSMENT_2026-04-21.md`. Findings absorbed into `RRR-WORK-001.md §5` and this file's §5 / §6.

---

## §8 — UPDATE PROTOCOL

This file is a per-PR living record. The agent merging any task that changes §2 inventory, §3 DONE, §4 WIP, §5 OUTSTANDING, §6 BLOCKERS, or §7 RETIRED **must** update this file in the same PR.

Rules:

1. **Same-PR update.** Any merge that moves a task from QUEUED → DONE, resolves a blocker, or introduces a new service/model updates the relevant section(s) here in the same PR that carries the work. No follow-up "sync" PRs.
2. **Authority order.** If this file and `RRR-WORK-001.md §5` disagree, the charter wins and this file is wrong — fix it. If this file and `OQMI_GOVERNANCE.md` disagree on doctrine, the governance doc wins.
3. **Stamp on every update.** Bump **Last Updated** in the header when editing any section.
4. **Do not cross-pollinate.** This file is RRR-scoped. Do not copy content from `OQMI_SYSTEM_STATE.md` (ChatNowZone–BUILD) into this file, or vice versa.
5. **Retirements are append-only.** §7 entries document permanent decisions. Removing a §7 entry requires CEO authorship per `OQMI_GOVERNANCE.md §11` amendment rules.

— End of file —
