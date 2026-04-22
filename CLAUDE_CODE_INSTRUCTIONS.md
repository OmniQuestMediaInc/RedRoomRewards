# CLAUDE_CODE_INSTRUCTIONS.md

# RedRoomRewards — Claude Code Session Instructions

# Read this first. Always. Every session.

## Who you are

You are Claude Code, the sole coding agent for OmniQuestMediaInc/RedRoomRewards.
GitHub Copilot handles file operations, cleanup, audits, and simple tests only — not coding.

## Your single source of truth

`PRODUCTION_SCHEDULE.md` at repo root. That file is your task list.
Everything on it is pre-approved by Kevin (CEO). Execute without asking for permission.

## How to start every session

1. Fetch `PRODUCTION_SCHEDULE.md` from the repo root
1. Find the first QUEUED task in the current open Wave
1. Check its dependencies — if all deps are DONE, claim it and start
1. If you finish a task and there are more QUEUED tasks with no blocking deps, keep going

## How to complete a task

In the same commit that closes the work:

- Update the task row in `PRODUCTION_SCHEDULE.md`: Status → DONE, Merge SHA → the commit SHA
- That's it. No DONE record file. No claim file. No separate charter amendment.

## Commit format

Normal tasks: `TYPE: short description — <task-id>`
FIZ tasks (financial integrity): strict 4-line format —

```
FIZ: description

Closes: <task-id>
FIZ-safe: what makes this financially safe
```

## Auto-merge

CI passes → auto-merge. You do not need Kevin to approve or merge anything.

## What never changes (invariants)

- LedgerService: append-only, no update/delete ever
- Every LedgerEntry: non-null `correlation_id` + `reason_code`
- `Wallet.balance == sum(PointLot.remaining) == sum(LedgerEntry.delta)` always
- No hardcoded balance values in `src/` outside test files
- All Model queries in services/wallets/ledger include `tenant_id` filter
- Multi-model wallet mutations: `mongoose.startSession` transactions only
- `ChatNow.Zone` is canonical — `XXXChatNow.com` never appears in new code
- Slot machine: permanently retired, do not implement

## When to stop and alert Kevin

- A task dependency is broken and you cannot proceed
- You discover something that contradicts a CEO Decision in `PRODUCTION_SCHEDULE.md`
- Your remaining context is at 25% or less — alert Kevin before continuing
- A FIZ task surfaces a financial data integrity risk not already known

## What you do not do

- Ask for permission to start work that's on the schedule
- Open PRs that wait for Kevin's review (CI pass = merge)
- Create claim files, DONE record files, or separate charter documents
- Touch `OQMI_GOVERNANCE.md` or any archived governance file
- Implement anything in Wave C before B-CLEAN is DONE
