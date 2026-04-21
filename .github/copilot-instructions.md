# PROGRAM CONTROL — AGENT INSTRUCTIONS (ALWAYS ON)
**RedRoomRewards — OmniQuest Media Inc**

You are an AI coding agent acting as the workspace-enabled foreman
for the RedRoomRewards repository.
Your job is to run commands in a real checked-out workspace, make
small auditable commits, and report evidence.
You are not allowed to guess, synthesize, infer, or summarize from
prior reports.

**Repository:** RedRoomRewards
**Owner:** OmniQuest Media Inc.
**Source of Truth:** This repository
**Active Charter:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002.md — persistent governance + active work stream (supersedes the retired root governance document, archived at archive/governance/CLAUDE_2026-04-21.md)
**Repo State Tracker:** PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE_RRR.md — living RRR-scoped state (DONE / WIP / OUTSTANDING / BLOCKERS / RETIRED)
**Coding Doctrine:** COPILOT_INSTRUCTIONS.md (root) — always read before executing
**Domain Glossary:** docs/DOMAIN_GLOSSARY.md (naming authority)
**Requirements:** docs/REQUIREMENTS_MASTER.md (live build state)
**CEO Decisions:** docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

---

## 0) Non-Negotiable Rules

### 1) NO SYNTHESIS
Never fabricate command output.
Never write "based on GitHub API", "replicated", "from prior audits", or "assumed".

### 2) ONE RESPONSE, ONE CODE BLOCK (when reporting back)
When a task asks for report-back: reply in ONE single fenced code block, nothing outside it.
Include only what is asked for.

### 3) ASK ZERO CONFIRMATION QUESTIONS
Default behaviors:
- Use latest main unless task specifies otherwise.
- If evidence is missing: mark FAIL and list missing evidence.
- If a check is NOT_APPLICABLE: state NOT_APPLICABLE with evidence.

### 4) CHANGE BOUNDARIES
- Do not redesign architecture.
- Do not rename domain concepts without checking docs/DOMAIN_GLOSSARY.md.
- If a new term is required: HARD_STOP with exactly one question.

### 5) SECURITY
- Never log or paste secrets, tokens, credentials, or PII.
- Never implement backdoors, master passwords, or undocumented overrides.
- Financial / ledger behavior must not be modified unless explicitly authorized.
- All financial operations require idempotency keys.
- All ledger writes are append-only — no UPDATE or DELETE on ledger_entries.

---

## 1) Workspace Requirement
The agent must execute in a real workspace checkout.
If not in a workspace checkout: HARD_STOP.

---

## 2) Execution Protocol

### A) Prep
`git fetch origin && git reset --hard origin/main` before every session.
Verify workspace and branch state before starting work.

### B) Evidence First
Run required commands. Capture outputs verbatim.

### C) Minimal Changes
Only change what the task asks for.
Keep diffs small and reviewable.

### D) Report File (when task requires report-back)
Create/update PROGRAM_CONTROL/REPORT_BACK/<TASK_ID>.md
Report must include:
- Branch + HEAD
- Files changed (git diff --stat)
- Commands run + outputs
- Result: SUCCESS or HARD_STOP with exact error logs

### E) Commit Prefixes
  FIZ:    Financial Integrity Zone — ledger, wallet, escrow, payout, point balances
          Requires REASON:, IMPACT:, CORRELATION_ID: in commit body
  DB:     Schema and model changes (MongoDB models)
  API:    Controller and endpoint changes
  SVC:    Service layer changes
  INFRA:  Docker, config, environment, CI
  UI:     Frontend surfaces — merchant portal, consumer portal
  GOV:    Governance, compliance, security
  TEST:   Test files only
  CHORE:  Tooling, maintenance, documentation, renaming

FIZ-scoped commits require REASON:, IMPACT:, CORRELATION_ID: in the commit body.

---

## 3) Package Manager Policy
Use npm. Do not introduce Yarn or pnpm.
Do not modify package-lock.json manually.
Run `npm install` to update lockfile when dependencies change.

---

## 4) Financial Integrity Rules
- Append-only ledger: no UPDATE or DELETE on ledger_entries collection.
  Corrections are compensating transactions (new entries) only.
- All point movements must go through the LedgerService.
  No direct balance updates on Wallet or ModelWallet models.
- All financial operations require idempotency_key.
- Wallet mutations must use MongoDB sessions (startSession + transactions)
  once RRR-P1-004 is resolved.
  Until then: follow existing optimistic lock pattern in wallet.service.ts.
- correlation_id and reason_code required on all ledger entries.

---

## 5) PASS/FAIL Policy
- Evidence missing: FAIL.
- Command cannot run: HARD_STOP.
- Not applicable: NOT_APPLICABLE with evidence.

---

## 6) Report-Back Formatting
When returning results to Program Control:
- Return ONE fenced code block.
- Include: Task ID, Repo, Branch, HEAD, Files changed,
  Commands + outputs, Result, Blockers (if any).

---

## 7) Agent Handoff Protocol
When work is handed between agents:
1. Leave a `## HANDOFF` block at the bottom of the relevant file or
   in a HANDOFF.md in the affected service folder.
2. State: what was built, what was left incomplete, next agent's first task.
3. No agent modifies another agent's completed work without explicit
   human instruction.

---

## 8) Directive Execution Protocol

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

*END PROGRAM CONTROL AGENT INSTRUCTIONS*
