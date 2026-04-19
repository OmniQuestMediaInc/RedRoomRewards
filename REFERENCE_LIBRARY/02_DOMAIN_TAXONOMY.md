# BUILD CONTROL - REWARDS Directive Domain Taxonomy

**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Initialized:** 2026-04-18

---

## PURPOSE

Authoritative map of all directive series for BUILD CONTROL - REWARDS.
Every directive issued must belong to a registered series listed here.
New series require CEO authorization before directives can be written.

---

## DIRECTIVE NAMING CONVENTION

```
Format:  {SERIES}-{NNN}
Example: FEAT-001, INFRA-003, AUTH-002
```

Series codes: 2-6 uppercase letters.
Numbers: zero-padded to 3 digits.
Sub-variants: `FEAT-001-PATCH`, `FEAT-001-CI`

---

## REGISTERED DIRECTIVE SERIES

| Series | Domain | Status | Blocked On |
|---|---|---|---|
| [POPULATE as series are authorized by CEO] | | | |

---

## AGENT ROUTING

| Agent | Used For |
|---|---|
| Claude Code (droid mode) | Schema, service code, complex implementation |
| Copilot | CHORE tasks, file ops, CI wiring, queue management |
| Claude Chat | Directive authoring, architecture decisions, analysis |

---

## PROGRAM CONTROL STRUCTURE

```
Repo path: PROGRAM_CONTROL/
  DIRECTIVES/QUEUE/       — Directives awaiting execution
  DIRECTIVES/IN_PROGRESS/ — Currently being worked
  DIRECTIVES/DONE/        — Completed
  DIRECTIVES/BACKLOGS/    — Deferred or blocked
  HANDOFFS/               — Thread-to-thread handoff documents
  REPORT_BACK/            — Agent report-back files
```

**Google Drive Program Control Folder:**
Root: https://drive.google.com/drive/folders/1p7GHVVrtoeESxcdTLU7yZujnGK5GVaus?usp=drive_link
Queue: [POPULATE after Drive setup]
In Progress: [POPULATE after Drive setup]
Done: [POPULATE after Drive setup]
Backlogs: [POPULATE after Drive setup]

**IMPORTANT:** Directives sent to Claude Code via Drive MUST be Google Docs (`convert=true`).
Plain text files return 403 errors.
