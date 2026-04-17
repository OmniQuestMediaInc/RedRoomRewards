# CLAUDE.md

---

## Financial Integrity Rules (non-negotiable)

- All point movements through LedgerService only — no direct Wallet mutations
- All financial operations require idempotency_key
- Ledger entries are append-only — no UPDATE or DELETE on ledger_entries
- correlation_id and reason_code required on all ledger entries
- No hardcoded balances anywhere in production code paths
- No backdoors, master passwords, or unauthorized settlement behaviour

---

## Execution Protocol

1. Read all instructions before writing any code
2. Execute exactly what is specified — do not invent scope
3. Run npm run build and npm test before committing
4. One PR per discrete work unit
5. Report-back encouraged: PROGRAM_CONTROL/REPORT_BACK/<ID>-report.md
6. Report-back format: STATUS / FILES_CHANGED / TEST_RESULTS / NOTES

---

## Hard Stops — halt and report BLOCKED

Stop immediately if any of these occur:

- FIZ file has a merge conflict
- Instructions ask for direct wallet balance mutations
- Instructions ask for UPDATE or DELETE on ledger_entries
- Build or tests fail after implementation attempt and fix is not obvious
- Any ambiguity that cannot be resolved from available context

Do not guess past a Hard Stop. Report the blocker clearly.

---

## Key File Paths

| Purpose             | Path                                         |
|---------------------|----------------------------------------------|
| Ledger service      | src/ledger/ledger.service.ts                 |
| Wallet service      | src/wallets/wallet.service.ts                |
| Wallet controller   | src/api/wallet.controller.ts                 |
| DB models           | src/db/models/                               |
| Service layer       | src/services/                                |
| API controllers     | src/api/                                     |
| Requirements master | docs/REQUIREMENTS_MASTER.md                  |
| Domain glossary     | docs/DOMAIN_GLOSSARY.md                      |
| CEO decisions       | docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md   |
| RRR spec            | docs/RRR_LOYALTY_ENGINE_SPEC_v1.1.md         |
| Queue (optional)    | PROGRAM_CONTROL/DIRECTIVES/QUEUE/            |
| In progress         | PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/      |
| Done                | PROGRAM_CONTROL/DIRECTIVES/DONE/             |
| Report-backs        | PROGRAM_CONTROL/REPORT_BACK/                 |

---

## Domain Glossary Authority

docs/DOMAIN_GLOSSARY.md is the naming authority for all identifiers.
Do not invent names not present in the glossary.
If a required term is missing: flag it in the report-back.

---

## Current Build State (as of 2026-04-17)

### P0 Bug — Fix Before Anything Else

src/api/wallet.controller.ts lines 131 and 186:
  const previousBalance = 1000; // Placeholder

This returns hardcoded fake balances in production.
This is a financial correctness bug. Directive RRR-P0-001 addresses it.

### Built
- src/ledger/ledger.service.ts — LedgerService (append-only)
- src/wallets/wallet.service.ts — WalletService (partial, optimistic lock)
- src/wallets/ — EscrowService
- src/services/point-accrual.service.ts — partial
- src/services/point-redemption.service.ts — partial
- src/services/point-expiration.service.ts — partial
- src/db/models/ledger-entry.model.ts
- src/db/models/wallet.model.ts
- src/db/models/model-wallet.model.ts
- src/db/models/escrow-item.model.ts

### Missing (required for full spec)
- src/db/models/point-lot.model.ts
- LoyaltyAccount model
- IdentityLink model
- Config tables: ValuationConfig, EarnRateConfig, TierCapConfig,
                 MicroTopupConfig, SpendOrderConfig

---

## CEO Decisions — All Locked 2026-04-17

Full detail in docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md.
Summary:

D1 — Slot machine: RETIRED. Remove all slot machine code.
D2 — Platform name: ChatNow.Zone (not XXXChatNow.com).
D3 — Diamond Concierge: 0 earn points. Burn eligible.
D4 — Inferno Bonus: configurable via inferno_multiplier on EarnRateConfig.
D5 — GGS Integration: deferred. Webhook endpoints only.

B1 — inferno_multiplier required field on EarnRateConfig, no default.
B2 — merchant_tier (launch) + rrr_member_tier (future, nullable).
B3 — Phase 1: RedRoomPleasures + Cyrano. Phase 2: ChatNow.Zone.
B4 — Cross-merchant 1:1 default via MerchantPairConfig.
B5 — Redemption caps via TierCapConfig.
     Placeholders: PLATINUM 50% GOLD 35% SILVER 20% MEMBER 10% GUEST 5%
