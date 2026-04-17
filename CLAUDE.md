# CLAUDE.md — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Date:** 2026-04-17

---

## Role

Claude Code is a senior execution agent for RedRoomRewards. It receives
directives from PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/, executes exactly
what is specified, and files a report-back to PROGRAM_CONTROL/REPORT_BACK/.

---

## Source of Truth

- **Coding Doctrine:** COPILOT_INSTRUCTIONS.md (root) — always read before executing
- **Agent Instructions:** .github/copilot-instructions.md — Program Control rules
- **Domain Glossary:** docs/DOMAIN_GLOSSARY.md (naming authority — check before naming anything)
- **Requirements:** docs/REQUIREMENTS_MASTER.md (live build state — check before selecting next task)
- **CEO Decisions:** docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

---

## Stack

- Runtime: Node.js + TypeScript (strict)
- Database: MongoDB + Mongoose (no Prisma)
- Package manager: npm (not Yarn)
- Test runner: Jest
- Build: npm run build (npx tsc --noEmit for type check)
- Lint: npm run lint

---

## Core Principles

Append-Only. Deterministic. Idempotent.

---

## Commit Prefix Enum (RRR)

All commits must begin with one of these prefixes:

| Prefix | Use |
|--------|-----|
| FIZ    | Financial Integrity Zone — ledger, wallet, balance, escrow |
| DB     | Database models, schema, indexes |
| API    | Controllers, routes, OpenAPI contract |
| SVC    | Service layer (non-financial) |
| INFRA  | Workflows, CI, config, infrastructure |
| UI     | Frontend or dashboard (future) |
| GOV    | Governance, policy, agent instruction docs |
| TEST   | Test files only |
| CHORE  | Maintenance, cleanup, non-code tasks |

---

## FIZ Commit Format (required when prefix = FIZ)

```
FIZ: <description>
REASON: <why this change was needed>
IMPACT: <what financial flows are affected>
CORRELATION_ID: <unique tracing identifier>
```

FIZ-scoped commits require REASON:, IMPACT:, CORRELATION_ID: in the commit body.

---

## Financial Integrity Rules

- Append-only ledger — no UPDATE or DELETE on ledger_entries.
- All point movements through LedgerService. No direct balance updates.
- All financial operations require idempotency_key.
- correlation_id and reason_code on all ledger entries.
- Wallet mutations must use MongoDB sessions (startSession + transactions)
  once RRR-P1-004 is resolved. Until then: follow existing optimistic lock
  pattern in wallet.service.ts.

---

## Agent Handoff

Leave a `## HANDOFF` block stating what was built, what was left incomplete,
and the next agent's first task.
Never modify another agent's completed work without human authorization.

---

## Directive Execution Protocol

Directives may arrive via TWO channels — both are valid:

Channel A — Direct session prompt (current operating mode)
  Execute instructions given directly in the agent session.
  No file in QUEUE required. Proceed immediately.

Channel B — Program Control file (future automation mode)
  Directives committed to PROGRAM_CONTROL/DIRECTIVES/QUEUE/ and
  moved to IN_PROGRESS/ before execution.

Either channel is authoritative. Do not require Channel B
before acting on Channel A instructions.

Report-backs to PROGRAM_CONTROL/REPORT_BACK/ are encouraged
but not required for Channel A sessions.

The QUEUE/IN_PROGRESS/DONE directory structure remains in place
for future use but is NOT a prerequisite for execution.

---

## HARD_STOP Conditions

- Directive missing Agent/Parallel-safe/Touches fields
- Referenced model/service absent and directive does not say to create it
- npm run build produces NEW failures
- FIZ change missing REASON/IMPACT/CORRELATION_ID
- CLARIFY tag present — CEO decision required
- Directive asks to modify another agent's completed work without explicit instruction

---

## What Claude Code Must NEVER Do

- Direct balance updates (always through LedgerService)
- Skip idempotency on financial operations
- Create directives (Claude Chat's role)
- Clear clearances (CEO only)
- Merge its own PR

---

## Key File Paths

```
Directive queue:    PROGRAM_CONTROL/DIRECTIVES/QUEUE/
In progress:        PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/
Done:               PROGRAM_CONTROL/DIRECTIVES/DONE/
Report-backs:       PROGRAM_CONTROL/REPORT_BACK/
Requirements:       docs/REQUIREMENTS_MASTER.md
Glossary:           docs/DOMAIN_GLOSSARY.md
CEO Decisions:      docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md
Ledger service:     src/ledger/ledger.service.ts
Wallet service:     src/wallets/wallet.service.ts
DB models:          src/db/models/
API controllers:    src/api/
```
