TASK: Bootstrap the OmniQuest Media Program Control pipeline in the
RedRoomRewards repository. This installs the autonomous build
infrastructure so Copilot and Claude Code can self-direct: find their
next task, execute it, file a report, and open a PR without human
prompting per task.

Read this entire instruction before taking any action.
Execute all steps in the order listed.
One commit per step unless stated otherwise.
Open one PR at the end containing all commits.
Title the PR: CHORE: Bootstrap Program Control pipeline — RRR

---

IMPORTANT CONTEXT

This repo uses:
- TypeScript / Node.js / MongoDB
- npm (package-lock.json is present — use npm, NOT Yarn)
- NestJS and Express patterns
- Existing agent governance: COPILOT_INSTRUCTIONS.md (root)
- Existing CI: .github/workflows/lint.yml and codeql-analysis.yml

Do NOT change the package manager.
Do NOT modify any existing source code in src/ or api/.
Do NOT modify COPILOT_INSTRUCTIONS.md.
Do NOT modify any existing .github/workflows/ files.
Create only the files listed below. Nothing else.

---

STEP 1 — Create PROGRAM_CONTROL directory structure

Create these files exactly as listed. One commit for all six together.

File: PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep
Content: (empty file)

File: PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep
Content: (empty file)

File: PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep
Content: (empty file)

File: PROGRAM_CONTROL/REPORT_BACK/.gitkeep
Content: (empty file)

File: PROGRAM_CONTROL/BACKLOGS/.gitkeep
Content: (empty file)

File: PROGRAM_CONTROL/CLEARANCES/.gitkeep
Content: (empty file)

Commit message:
CHORE: Bootstrap PROGRAM_CONTROL directory structure for autonomous pipeline

---

STEP 2 — Create .github/copilot-instructions.md

Create .github/copilot-instructions.md with the following content exactly.

# PROGRAM CONTROL — AGENT INSTRUCTIONS (ALWAYS ON)
# RedRoomRewards — OmniQuest Media Inc.

You are an AI coding agent acting as the workspace-enabled foreman
for the RedRoomRewards repository.
Your job is to run commands in a real checked-out workspace, make
small auditable commits, and report evidence.
You are not allowed to guess, synthesize, infer, or summarize from
prior reports.

**Repository:** RedRoomRewards
**Owner:** OmniQuest Media Inc.
**Source of Truth:** This repository
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
git fetch origin && git reset --hard origin/main before every session.
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
  FIZ:    Financial Integrity Zone — ledger, wallet, escrow, payout, point balances
          Requires REASON:, IMPACT:, CORRELATION_ID: in commit body
  DB:     Schema and model changes (MongoDB models)
  API:    Controller and endpoint changes
  SVC:    Service layer changes
  INFRA:  Docker, config, environment, CI
  UI:     Frontend surfaces — merchant portal, consumer portal
  GOV:    Governance, compliance, security
  TEST:   Test files only
  CHORE:  Tooling, maintenance, documentation, renaming

FIZ-scoped commits require REASON:, IMPACT:, CORRELATION_ID: in the commit body.

---

## 3) Package Manager Policy
Use npm. Do not introduce Yarn or pnpm.
Do not modify package-lock.json manually.
Run npm install to update lockfile when dependencies change.

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
1. Leave a ## HANDOFF block at the bottom of the relevant file or
   in a HANDOFF.md in the affected service folder.
2. State: what was built, what was left incomplete, next agent's first task.
3. No agent modifies another agent's completed work without explicit
   human instruction.

---

## 8) Autonomous Directive Protocol

When operating in autonomous / background / Workspace mode, follow
this protocol without waiting for human prompting per task.

### Step 1 — Sync
Run: git fetch origin && git reset --hard origin/main
Never act on stale repo state.

### Step 2 — Find next task
Read docs/REQUIREMENTS_MASTER.md.
Check PROGRAM_CONTROL/DIRECTIVES/QUEUE/ for directive files where:
  - **Agent:** COPILOT is in the header
  - No file exists in PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/ for this ID
  - No open PR references this directive ID
Pick the oldest file alphabetically.
If no eligible directive: stop. Do not invent work.

### Step 3 — Conflict check
Read the **Touches:** field from the selected directive.
Check all QUEUE and IN_PROGRESS directives for overlapping file paths.
If overlap found:
  - Do NOT proceed.
  - Open GitHub Issue: "CONFLICT: [ID-A] x [ID-B] — [filepath]"
  - Label: needs-conflict-review
  - Stop. Await human resolution.

### Step 4 — Move to IN_PROGRESS
Move: PROGRAM_CONTROL/DIRECTIVES/QUEUE/[ID].md
  To: PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/[ID].md
Commit: CHORE: [ID] QUEUE → IN_PROGRESS
Push to new branch: copilot/[id-lowercase]

### Step 5 — Execute
Read the directive file completely before writing any code.
Execute exactly as written. No synthesis. No deviation. DROID MODE.

### Step 6 — File report-back
Create: PROGRAM_CONTROL/REPORT_BACK/[ID]-REPORT-BACK.md
Include: branch, HEAD, files changed (git diff --stat),
npm run build result, npm test result (if applicable),
result: SUCCESS or HARD_STOP.

### Step 7 — Update REQUIREMENTS_MASTER
Open docs/REQUIREMENTS_MASTER.md.
Find the row matching this directive's ID.
Update Status: QUEUED → DONE.
If directive retired code: update row Status to RETIRED.

### Step 8 — Move to DONE
Move: PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/[ID].md
  To: PROGRAM_CONTROL/DIRECTIVES/DONE/[ID].md
One commit: report-back + REQUIREMENTS_MASTER update + directive move.
Commit: CHORE: [ID] complete — report-back filed, directive moved to DONE

### Step 9 — Open PR
Open PR targeting main.
Title: [PREFIX]: [ID] — [short description]
Body: full report-back content
Labels: copilot-task, ready-for-review
FIZ-scoped: also add label fiz-review-required

IMPORTANT: GitHub Copilot coding agent will not open a PR unless
explicitly instructed. Always include this phrase in your session
prompt: "When your work is complete, create a pull request targeting main."

### HARD_STOP conditions
Stop immediately if:
  - Directive missing required fields (Agent/Parallel-safe/Touches)
  - A referenced model or service does not exist and directive does not say to create it
  - npm run build produces NEW errors
  - Any FIZ-scoped change lacks REASON/IMPACT/CORRELATION_ID
  - A CLARIFY tag is present — CEO decision required first

### What Copilot must NEVER do autonomously
  - Modify another agent's completed work without explicit instruction
  - Use direct balance updates (all movements through LedgerService)
  - Skip idempotency checks on financial operations
  - Create directives (directive authoring is Claude Chat's role)
  - Make CEO-level decisions when CLARIFY tag is present
  - Merge its own PR (auto-merge handles this via CI)

---

*END PROGRAM CONTROL AGENT INSTRUCTIONS*

Commit message:
CHORE: Create .github/copilot-instructions.md — Program Control agent instructions

---

STEP 3 — Create CLAUDE.md

Create CLAUDE.md at the repo root with the following content exactly.

# Claude Code — Project Instructions
# RedRoomRewards — OmniQuest Media Inc.

## Source of Truth
- **Coding Doctrine:** COPILOT_INSTRUCTIONS.md (root) — always read before executing
- **Agent Instructions:** .github/copilot-instructions.md — Program Control rules
- **Domain Glossary:** docs/DOMAIN_GLOSSARY.md (naming authority — check before naming anything)
- **Requirements:** docs/REQUIREMENTS_MASTER.md (live build state — check before selecting next task)
- **CEO Decisions:** docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

## Core Principles
Append-Only. Deterministic. Idempotent.

## Package Manager
Use npm. Do not introduce Yarn or pnpm.

## Commit Prefixes
FIZ: | DB: | API: | SVC: | INFRA: | UI: | GOV: | TEST: | CHORE:
FIZ-scoped commits require REASON:, IMPACT:, CORRELATION_ID: in the commit body.

## Financial Integrity Rules
- Append-only ledger — no UPDATE or DELETE on ledger_entries.
- All point movements through LedgerService. No direct balance updates.
- All financial operations require idempotency_key.
- correlation_id and reason_code on all ledger entries.

## Agent Handoff
Leave a ## HANDOFF block stating what was built, what was left incomplete,
and the next agent's first task.
Never modify another agent's completed work without human authorization.

---

## Autonomous Directive Protocol (DROID MODE)

When operating autonomously, Claude Code follows this protocol exactly.
DROID MODE applies — execute directives as written, no synthesis, no deviation.

### Step 1 — Sync
Run: git fetch origin && git reset --hard origin/main

### Step 2 — Find next task
Read docs/REQUIREMENTS_MASTER.md.
Find the first row where:
  - Status = QUEUED
  - A directive file exists at PROGRAM_CONTROL/DIRECTIVES/QUEUE/[ID].md
  - **Agent:** field = CLAUDE_CODE
  - No file in PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/ for this ID
  - No open PR references this directive ID
If none: stop. Do not invent work.

### Step 3 — Conflict check
Read **Touches:** field from selected directive.
Check QUEUE and IN_PROGRESS for overlapping file paths.
If overlap: HARD_STOP — output CONFLICT DETECTED, await human resolution.

### Step 4 — Pre-flight reads (MANDATORY)
Before writing any code, read:
  1. Full directive file
  2. docs/DOMAIN_GLOSSARY.md
  3. docs/REQUIREMENTS_MASTER.md
  4. Any models or services the directive references (confirm they exist)
  5. Files listed in "Files to Confirm Unchanged"

### Step 5 — Move to IN_PROGRESS
Move QUEUE/[ID].md → IN_PROGRESS/[ID].md
Commit: CHORE: [ID] QUEUE → IN_PROGRESS
Branch: claude/[id-lowercase]-[random-suffix]

### Step 6 — Execute
Execute directive exactly as written. DROID MODE.
Follow all invariants listed in the directive checklist.

### Step 7 — Build and test check
Run: npm run build
Run: npm test (if applicable)
Zero NEW errors required. Pre-existing failures acceptable if confirmed on baseline.
If new failures: fix before proceeding. If unfixable within scope: HARD_STOP.

### Step 8 — File report-back
Create: PROGRAM_CONTROL/REPORT_BACK/[ID]-REPORT-BACK.md
Include: branch, HEAD, files created/modified/unchanged,
npm run build result, all invariants confirmed or flagged,
any deviations from directive, git diff --stat, result: SUCCESS or HARD_STOP.

### Step 9 — Update REQUIREMENTS_MASTER
Open docs/REQUIREMENTS_MASTER.md.
Update Status for this directive's requirement rows: QUEUED → DONE.

### Step 10 — Move to DONE and commit
Move IN_PROGRESS/[ID].md → DONE/[ID].md
One commit: report-back + REQUIREMENTS_MASTER + directive move + source changes.
Non-FIZ: CHORE: [ID] complete — report-back filed, directive moved to DONE
FIZ: FIZ: [ID] — [description] / REASON: / IMPACT: / CORRELATION_ID: / GATE:

### Step 11 — Open PR
PR targeting main.
Title: [PREFIX]: [ID] — [short description]
Body: full report-back
Labels: claude-code-task, ready-for-review
FIZ: also add fiz-review-required

## HARD_STOP Conditions
- Directive missing Agent/Parallel-safe/Touches fields
- Referenced model/service absent and directive does not say to create it
- npm run build produces NEW failures
- FIZ change missing REASON/IMPACT/CORRELATION_ID
- CLARIFY tag present — CEO decision required
- Directive asks to modify another agent's completed work without explicit instruction

## What Claude Code Must NEVER Do
- Direct balance updates (always through LedgerService)
- Skip idempotency on financial operations
- Create directives (Claude Chat's role)
- Clear clearances (CEO only)
- Merge its own PR

## Key File Paths
  Directive queue:    PROGRAM_CONTROL/DIRECTIVES/QUEUE/
  In progress:        PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/
  Done:               PROGRAM_CONTROL/DIRECTIVES/DONE/
  Report-backs:       PROGRAM_CONTROL/REPORT_BACK/
  Requirements:       docs/REQUIREMENTS_MASTER.md
  Glossary:           docs/DOMAIN_GLOSSARY.md
  CEO Decisions:      docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md
  Ledger service:     src/ledger/ledger.service.ts
  Wallet service:     src/wallets/wallet.service.ts
  DB models:          src/db/models/
  API controllers:    src/api/

Commit message:
CHORE: Create CLAUDE.md — Claude Code autonomous directive protocol

---

STEP 4 — Create .github/workflows/directive-intake.yml

Create .github/workflows/directive-intake.yml with the following content exactly.

name: Directive Intake — Auto-Issue on Queue Push

on:
  push:
    branches: [main]
    paths:
      - 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/**.md'

permissions:
  contents: read
  issues: write

jobs:
  open-directive-issue:
    name: Open Copilot-task issue for each new directive
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect newly added directive files
        id: detect
        run: |
          NEW_FILES=$(git diff --name-only --diff-filter=A HEAD~1 HEAD -- 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/*.md' | grep -v '\.gitkeep$' || true)
          if [ -z "$NEW_FILES" ]; then
            echo "No new directive files detected. Exiting cleanly."
            echo "has_new=false" >> "$GITHUB_OUTPUT"
          else
            echo "Detected new directive files:"
            echo "$NEW_FILES"
            echo "has_new=true" >> "$GITHUB_OUTPUT"
            {
              echo "new_files<<EOF"
              echo "$NEW_FILES"
              echo "EOF"
            } >> "$GITHUB_OUTPUT"
          fi

      - name: Open Issue per new directive
        if: steps.detect.outputs.has_new == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          while IFS= read -r FILE; do
            [ -z "$FILE" ] && continue
            ID=$(basename "$FILE" .md)
            TITLE="DIRECTIVE: ${ID}"
            echo "Opening issue for ${ID} (${FILE})"
            SEPARATOR="---"
            PR_INSTRUCTION=$(printf '\n\n%s\n**Copilot agent instruction:** When your work is complete, create a\npull request targeting main.\nTitle format: [PREFIX]: [DIRECTIVE-ID] — [short description]\nLabels: copilot-task, ready-for-review\nIf this directive is FIZ-scoped (FIZ: YES in header), also add\nlabel fiz-review-required.' "$SEPARATOR")

            gh issue create \
              --title "$TITLE" \
              --body "$(cat "$FILE")$PR_INSTRUCTION" \
              --label "copilot-task" \
            && echo "CHECK: Issue created for ${ID}" \
            || echo "WARNING: Issue creation failed or already exists for ${ID} — skipping"
          done <<< "${{ steps.detect.outputs.new_files }}"

Commit message:
CHORE: Create directive-intake.yml — auto-issue on QUEUE push

---

STEP 5 — Create .github/workflows/directive-dispatch.yml

Create .github/workflows/directive-dispatch.yml with the following content exactly.

name: Directive Dispatch — Auto-Route, Lifecycle, Conflict Detection

on:
  issues:
    types: [opened]
  pull_request:
    types: [opened, closed]
    branches: [main]
  push:
    branches: [main]
    paths:
      - 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/**.md'

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:

  assign-to-agent:
    name: Assign directive issue to correct agent
    if: github.event_name == 'issues' && github.event.action == 'opened'
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - name: Parse agent from issue body
        id: parse
        env:
          ISSUE_BODY: ${{ github.event.issue.body }}
        run: |
          AGENT=$(echo "$ISSUE_BODY" | grep -oP '(?<=\*\*Agent:\*\* ).*' | head -1 | tr -d '[:space:]')
          echo "CHECK: Detected agent = ${AGENT}"
          echo "agent=${AGENT}" >> "$GITHUB_OUTPUT"

      - name: Route to Copilot
        if: steps.parse.outputs.agent == 'COPILOT'
        run: |
          echo "CHECK: Assigning issue ${{ github.event.issue.number }} to app/copilot"
          gh issue edit ${{ github.event.issue.number }} \
            --repo ${{ github.repository }} \
            --add-assignee "app/copilot" \
          && echo "CHECK: Assigned to app/copilot" \
          || echo "WARNING: Could not assign to app/copilot"

      - name: Route to Claude Code
        if: steps.parse.outputs.agent == 'CLAUDE_CODE'
        run: |
          gh issue edit ${{ github.event.issue.number }} \
            --repo ${{ github.repository }} \
            --add-label "claude-code-task"
          gh issue comment ${{ github.event.issue.number }} \
            --repo ${{ github.repository }} \
            --body "This directive is scoped for Claude Code (DROID MODE). Paste the directive content to Claude Code to execute."

      - name: Add dispatched label
        run: |
          gh issue edit ${{ github.event.issue.number }} \
            --repo ${{ github.repository }} \
            --add-label "dispatched" \
          || echo "WARNING: Could not add dispatched label"

  conflict-detection:
    name: Detect file-path conflicts between queued directives
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Scan for conflicts
        run: |
          python3 - <<'PYEOF'
          import os, re, subprocess

          QUEUE_DIR = "PROGRAM_CONTROL/DIRECTIVES/QUEUE"
          IN_PROGRESS_DIR = "PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS"

          def parse_touches(filepath):
              try:
                  with open(filepath) as f:
                      for line in f:
                          m = re.search(r'\*\*Touches:\*\*\s*(.+)', line)
                          if m:
                              raw = m.group(1).strip()
                              return [p.strip() for p in raw.split(',') if p.strip()]
              except Exception:
                  pass
              return []

          def directive_id(filepath):
              return os.path.splitext(os.path.basename(filepath))[0]

          directives = {}
          for d in [QUEUE_DIR, IN_PROGRESS_DIR]:
              if not os.path.isdir(d):
                  continue
              for fname in os.listdir(d):
                  if not fname.endswith('.md') or fname == '.gitkeep':
                      continue
                  fpath = os.path.join(d, fname)
                  did = directive_id(fpath)
                  touches = parse_touches(fpath)
                  if touches:
                      directives[did] = {'path': fpath, 'touches': touches}

          print(f"CHECK: Scanned {len(directives)} directives")
          path_map = {}
          for did, info in directives.items():
              for t in info['touches']:
                  path_map.setdefault(t, []).append(did)

          conflicts = {p: ids for p, ids in path_map.items() if len(ids) >= 2}
          if not conflicts:
              print("CHECK: No file-path conflicts detected")
          else:
              repo = os.environ.get('GITHUB_REPOSITORY', '')
              for fpath, ids in conflicts.items():
                  for i in range(len(ids)):
                      for j in range(i + 1, len(ids)):
                          id_a, id_b = ids[i], ids[j]
                          title = f"CONFLICT: {id_a} x {id_b} — {fpath}"
                          body = (f"Directives **{id_a}** and **{id_b}** both touch `{fpath}`.\n\n"
                                  f"Resolve sequencing before either executes.\n\n"
                                  f"- {id_a}: `PROGRAM_CONTROL/DIRECTIVES/QUEUE/{id_a}.md`\n"
                                  f"- {id_b}: `PROGRAM_CONTROL/DIRECTIVES/QUEUE/{id_b}.md`")
                          subprocess.run(['gh', 'issue', 'create', '--repo', repo,
                                         '--title', title, '--body', body,
                                         '--label', 'conflict,needs-conflict-review'],
                                        capture_output=True, text=True)
                          print(f"WARNING: Conflict issue opened: {title}")
          PYEOF

  lifecycle-pr-opened:
    name: Move directive QUEUE to IN_PROGRESS on PR open
    if: github.event_name == 'pull_request' && github.event.action == 'opened'
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - name: Checkout PR branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract directive ID and move file
        run: |
          PR_TITLE="${{ github.event.pull_request.title }}"
          PR_NUMBER="${{ github.event.pull_request.number }}"
          DIRECTIVE_ID=$(echo "$PR_TITLE" | sed 's/^[^:]*: *//' | awk -F' ' '{print $1}' | tr -d '—')
          echo "CHECK: Directive ID = ${DIRECTIVE_ID}"
          if [ -z "$DIRECTIVE_ID" ]; then exit 0; fi
          QUEUE_FILE="PROGRAM_CONTROL/DIRECTIVES/QUEUE/${DIRECTIVE_ID}.md"
          IN_PROGRESS_FILE="PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/${DIRECTIVE_ID}.md"
          if [ ! -f "$QUEUE_FILE" ]; then
            echo "CHECK: ${QUEUE_FILE} not found — skipping"
            exit 0
          fi
          mkdir -p "PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS"
          mv "$QUEUE_FILE" "$IN_PROGRESS_FILE"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add "$QUEUE_FILE" "$IN_PROGRESS_FILE"
          git commit -m "CHORE: ${DIRECTIVE_ID} QUEUE → IN_PROGRESS (PR #${PR_NUMBER} opened)"
          git push origin HEAD:"${{ github.event.pull_request.head.ref }}"

  lifecycle-pr-merged:
    name: Move directive IN_PROGRESS to DONE on PR merge
    if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    steps:
      - name: Checkout main
        uses: actions/checkout@v4
        with:
          ref: main
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract directive ID and move file
        run: |
          PR_TITLE="${{ github.event.pull_request.title }}"
          PR_NUMBER="${{ github.event.pull_request.number }}"
          DIRECTIVE_ID=$(echo "$PR_TITLE" | sed 's/^[^:]*: *//' | awk -F' ' '{print $1}' | tr -d '—')
          if [ -z "$DIRECTIVE_ID" ]; then exit 0; fi
          IN_PROGRESS_FILE="PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/${DIRECTIVE_ID}.md"
          DONE_FILE="PROGRAM_CONTROL/DIRECTIVES/DONE/${DIRECTIVE_ID}.md"
          if [ ! -f "$IN_PROGRESS_FILE" ]; then
            echo "CHECK: ${IN_PROGRESS_FILE} not found — skipping"
            exit 0
          fi
          mkdir -p "PROGRAM_CONTROL/DIRECTIVES/DONE"
          mv "$IN_PROGRESS_FILE" "$DONE_FILE"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add "$IN_PROGRESS_FILE" "$DONE_FILE"
          git commit -m "CHORE: ${DIRECTIVE_ID} IN_PROGRESS → DONE (PR #${PR_NUMBER} merged)"
          git push origin main

      - name: Close corresponding GitHub Issue
        run: |
          PR_TITLE="${{ github.event.pull_request.title }}"
          PR_NUMBER="${{ github.event.pull_request.number }}"
          DIRECTIVE_ID=$(echo "$PR_TITLE" | sed 's/^[^:]*: *//' | awk -F' ' '{print $1}' | tr -d '—')
          if [ -z "$DIRECTIVE_ID" ]; then exit 0; fi
          ISSUE_TITLE="DIRECTIVE: ${DIRECTIVE_ID}"
          ISSUE_NUMBER=$(gh issue list \
            --repo ${{ github.repository }} \
            --search "\"${ISSUE_TITLE}\" in:title" \
            --state open \
            --json number,title \
            --jq ".[] | select(.title == \"${ISSUE_TITLE}\") | .number" \
            | head -1)
          if [ -z "$ISSUE_NUMBER" ]; then exit 0; fi
          gh issue close "$ISSUE_NUMBER" \
            --repo ${{ github.repository }} \
            --comment "Directive complete. PR #${PR_NUMBER} merged." \
          || echo "WARNING: Could not close issue"

Commit message:
CHORE: Create directive-dispatch.yml — auto-routing, lifecycle, conflict detection

---

STEP 6 — Create .github/workflows/auto-merge.yml

Create .github/workflows/auto-merge.yml with the following content exactly.

name: Auto Merge

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  enable-auto-merge:
    name: Enable Auto Merge
    runs-on: ubuntu-latest

    steps:
      - name: Enable auto-merge for PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          if gh pr merge "${{ github.event.pull_request.number }}" \
               --repo "${{ github.repository }}" \
               --auto \
               --squash; then
            echo "CHECK: Auto-merge enabled on PR #${{ github.event.pull_request.number }}"
          else
            echo "WARNING: Auto-merge could not be enabled — may already be set or branch protection not configured"
          fi

Commit message:
CHORE: Create auto-merge.yml — squash merge on CI green

---

STEP 7 — Create docs/DOMAIN_GLOSSARY.md

Create docs/DOMAIN_GLOSSARY.md with the following content exactly.

# DOMAIN GLOSSARY — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Last updated:** 2026-04-17

This file is the canonical naming authority for all code, comments,
documentation, and identifiers in the RedRoomRewards codebase.
Agents must check this file before naming any domain concept.
If a required term is absent: HARD_STOP and raise a naming question
to Program Control. Do not invent terms.

HOW TO USE:
- Exact casing is required in all code, comments, and docs
- Database identifiers use snake_case equivalents
- Terms marked RETIRED must not appear in any new code
- If you see a RETIRED term in existing code, flag it in your report-back

---

## PLATFORM

| Term | Definition | Code identifier |
|------|------------|-----------------|
| RedRoomRewards | OQMInc SaaS loyalty and rewards engine | RedRoomRewards, RRR |
| RRR | RedRoomRewards abbreviation | RRR |
| OmniQuest Media Inc. | Parent company | OmniQuestMediaInc, OQMI |
| ChatNow.Zone | Primary merchant tenant | ChatNow.Zone, chatnow_zone |
| RedRoomPleasures | Merchant tenant (Phase 1) | RedRoomPleasures |
| Cyrano | Merchant tenant (Phase 1) | Cyrano |

---

## USERS AND ROLES

| Term | Definition | Code identifier |
|------|------------|-----------------|
| Members | RRR loyalty program participants (consumers) | members, member_id, loyalty_account_id |
| Guests | Consumers on connected merchant platforms | guests, guest_id |
| Models | Content creators on connected platforms | models, model_id |
| Operators / Admins | Administrative users with elevated access | operators, admin |
| Merchants | Platform tenants using RRR as SaaS | merchants, tenant_id |
| RRR Account Rep | OQMInc staff who authorize merchant program activations | rrr_account_rep |

---

## LOYALTY ECONOMY

| Term | Definition | Code identifier |
|------|------------|-----------------|
| RRR Points | Loyalty currency awarded to members | rrr_points, points |
| Earn event | Action that awards points to a member | earn_event |
| Redemption | Application of points to reduce purchase cost | redemption |
| PointLot | Individual award batch with its own expiry | point_lot, lot_id |
| Wallet | Current point balance record for a member | wallet, wallet_id |
| Consumer Points Wallet | Member wallet for redeemable points | consumer_points |
| Model Allocation Wallet | Non-redeemable balance for models to gift | model_allocation |
| LedgerEntry | Immutable append-only record of one point movement | ledger_entry, ledger_id |
| Idempotency key | Unique key preventing duplicate transactions | idempotency_key |
| Escrow | Points held pending confirmation of an event | escrow, escrow_item |
| Correlation ID | Tracing identifier linking related operations | correlation_id |
| Reason code | Audit code classifying why a ledger entry was created | reason_code |
| Spend ordering | EARLIEST_EXPIRY_THEN_FIFO consumption rule | spend_ordering |
| Micro top-up | Small point purchase to unblock a redemption threshold | micro_topup |
| Model gifting | Transfer of points from a model allocation wallet to a member | model_gift |

---

## MERCHANT CONFIGURATION

| Term | Definition | Code identifier |
|------|------------|-----------------|
| Earn rate | Points awarded per $1.00 USD spent (default 12) | earn_rate, points_per_usd_spend |
| Redemption cap | Maximum percentage of order value redeemable in points, by tier | max_discount_percent |
| Valuation | Points-to-USD conversion rate (default 1000 pts = $1.00) | valuation, points_per_usd |
| Effective-dated config | Configuration with a start/end date, replacing prior config on activation | effective_start_at, effective_end_at |
| Merchant tier | Merchant-defined membership level for their customers | merchant_tier |
| RRR member tier | Cross-merchant loyalty level (future — architecture must support) | rrr_member_tier |
| Inferno multiplier | Earn rate multiplier for qualifying Room-Heat Inferno sessions | inferno_multiplier |
| Standard template | Pre-built earn/burn configuration merchants select | standard_template |
| Custom template | Merchant-configured earn/burn program requiring RRR rep authorization | custom_template |

---

## FINANCIAL AND COMPLIANCE

| Term | Definition | Code identifier |
|------|------------|-----------------|
| Append-only ledger | Ledger where entries are written once and never modified | append_only |
| Compensating transaction | Corrective ledger entry that offsets a prior entry | REVERSAL, reason_code: REVERSAL |
| Chargeback reversal | Points clawback triggered by a payment chargeback | CHARGEBACK_REVERSAL |
| Negative balance | Allowed only via reversal, chargeback, or clawback failure | negative_balance |
| Liability | Outstanding unredeemed points expressed as USD equivalent | liability_usd |
| Cross-merchant redemption | Redeeming points earned at one merchant at a different merchant | cross_merchant |
| Exchange rate | Conversion factor between merchants for cross-merchant redemption (default 1:1) | cross_merchant_exchange_rate |
| FIZ | Financial Integrity Zone — all ledger, wallet, escrow, and payout code paths | FIZ |

---

## COMMIT PREFIXES

| Prefix | Scope |
|--------|-------|
| FIZ: | Financial Integrity Zone — ledger, wallet, escrow, point balances |
| DB: | Schema and MongoDB model changes |
| API: | Controller and endpoint changes |
| SVC: | Service layer changes |
| INFRA: | Docker, config, environment, CI |
| UI: | Frontend surfaces — merchant portal, consumer portal |
| GOV: | Governance, compliance, security |
| TEST: | Test files only |
| CHORE: | Tooling, maintenance, documentation, renaming |

FIZ-scoped commits require REASON:, IMPACT:, CORRELATION_ID: in the commit body.

---

*This glossary is the naming authority. To add a term: CEO authorization required.*
*File a CHORE: commit with reason in the commit message.*

Commit message:
CHORE: Create docs/DOMAIN_GLOSSARY.md — canonical naming authority

---

STEP 8 — Create docs/REQUIREMENTS_MASTER.md

Create docs/REQUIREMENTS_MASTER.md with the following content exactly.

# REQUIREMENTS MASTER — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Source:** RRR_CEO_DECISIONS_FINAL_2026-04-17.md + RRR_LOYALTY_ENGINE_SPEC_v1.1.md
**Hard launch target:** Phase 1 (RedRoomPleasures + Cyrano) before ChatNow.Zone
**Last updated:** 2026-04-17

> How to use this file:
> Agents: read this file before selecting your next directive.
> Update the Status column when a directive closes.
> Never mark a requirement DONE without a filed report-back.

## STATUS KEY

| Status | Meaning |
|--------|---------|
| QUEUED | Directive authored, in QUEUE, ready to execute |
| IN_PROGRESS | Directive executing — PR open |
| DONE | Code on main, report-back filed, verified |
| VERIFY | Existing code — confirm it satisfies spec before ship |
| DEFERRED | Not required at launch. Architecture must not block. |
| RETIRED | Removed from codebase. No code should reference this. |
| NEEDS_DIRECTIVE | Requirement confirmed, directive not yet authored |
| CLARIFY | Blocked — CEO decision required |

---

## P0 — FIX IMMEDIATELY (financial correctness bugs)

| ID | Requirement | Status | Directive | Notes |
|----|-------------|--------|-----------|-------|
| RRR-P0-001 | Wire wallet controller credit/deduct to real services. Remove const previousBalance = 1000 placeholders at wallet.controller.ts:131 and :186. | NEEDS_DIRECTIVE | — | Live financial correctness bug |
| RRR-P0-002 | Enforce idempotency on credit/deduct paths in wallet.controller.ts | NEEDS_DIRECTIVE | — | Double-spend risk on retry |
| RRR-P0-003 | Add CI workflow: npm run lint + tsc --noEmit + npm test on PR | NEEDS_DIRECTIVE | — | TypeScript errors entering main undetected |

---

## P1 — FOUNDATION (required before product features)

| ID | Requirement | Status | Directive | Notes |
|----|-------------|--------|-----------|-------|
| RRR-P1-001 | Implement PointLot MongoDB model and lot-aware earn/expiry | NEEDS_DIRECTIVE | — | All spec features depend on this |
| RRR-P1-002 | Implement LoyaltyAccount + IdentityLink models. Default tenant: ChatNow.Zone | NEEDS_DIRECTIVE | — | CEO Decision 2 |
| RRR-P1-003 | Effective-dated config models: ValuationConfig, EarnRateConfig, TierCapConfig (merchant-configurable), MicroTopupConfig, SpendOrderConfig | NEEDS_DIRECTIVE | — | All configurable per merchant |
| RRR-P1-004 | Wrap wallet mutations in MongoDB sessions (startSession + transactions) | NEEDS_DIRECTIVE | — | Production concurrency safety |
| RRR-P1-005 | Implement spend ordering (EARLIEST_EXPIRY_THEN_FIFO) | NEEDS_DIRECTIVE | — | Spec requirement |
| RRR-P1-006 | Repo-wide rename: legacy platform name → ChatNow.Zone in all docs, comments, configs, model defaults | NEEDS_DIRECTIVE | — | CEO Decision 2 |
| RRR-P1-007 | Remove/archive slot machine code and spec documents | NEEDS_DIRECTIVE | — | CEO Decision 1 — retired |

---

## P2 — PRODUCT FEATURES (after P1 complete)

| ID | Requirement | Status | Directive | Notes |
|----|-------------|--------|-----------|-------|
| RRR-P2-001 | Checkout quote endpoint (/v1/checkout/quote) — includes partial redemption UI data | NEEDS_DIRECTIVE | — | CEO note C3, C4 |
| RRR-P2-002 | Redemption reserve/commit/release endpoints with partial amount support | NEEDS_DIRECTIVE | — | CEO note C4, C5 |
| RRR-P2-003 | Micro top-up trigger and purchase flow | NEEDS_DIRECTIVE | — | Spec Section 10 |
| RRR-P2-004 | Model gifting service and endpoint | NEEDS_DIRECTIVE | — | Spec Section 8 |
| RRR-P2-005 | Model allocation scheduler (monthly) | NEEDS_DIRECTIVE | — | Spec Section 8 |
| RRR-P2-006 | Tier multipliers wired to earn logic (merchant-configurable) | NEEDS_DIRECTIVE | — | CEO Decision B2 |
| RRR-P2-007 | Promo engine — scheduling, segmentation, caps, multipliers, couponing, redemption windows, product-level rules | NEEDS_DIRECTIVE | — | CEO note C6 (expanded) |
| RRR-P2-008 | Negative balance paydown logic | NEEDS_DIRECTIVE | — | Spec Section 7 |
| RRR-P2-009 | Chargeback-specific reversal path | NEEDS_DIRECTIVE | — | Spec requirement |
| RRR-P2-010 | Liability reporting endpoint (near real-time) | NEEDS_DIRECTIVE | — | Spec Section 12 |
| RRR-P2-011 | Merchant login and reporting surface | NEEDS_DIRECTIVE | — | CEO note C1 |
| RRR-P2-012 | Consumer member login surface | NEEDS_DIRECTIVE | — | CEO note C1 |
| RRR-P2-013 | Earn/burn template library — standard + customizable | NEEDS_DIRECTIVE | — | CEO note C2 |
| RRR-P2-014 | RRR account rep authorization workflow for merchant program activation | NEEDS_DIRECTIVE | — | CEO note C2 |
| RRR-P2-015 | Customer segmentation engine | NEEDS_DIRECTIVE | — | CEO note C6 |
| RRR-P2-016 | Segment-targeted communications (email/in-app) | NEEDS_DIRECTIVE | — | CEO note C6 |
| RRR-P2-017 | Tier-based redemption caps (merchant-configurable via TierCapConfig) | NEEDS_DIRECTIVE | — | CEO Decision B5 |

---

## P3 — CNZ INTEGRATION (Phase 2 — after Phase 1 merchants live)

| ID | Requirement | Status | Directive | Notes |
|----|-------------|--------|-----------|-------|
| RRR-P3-001 | CZT-aware earn event type in ingest-event.model.ts | NEEDS_DIRECTIVE | — | CEO Decision 2 |
| RRR-P3-002 | WELCOME_CREDIT earn path from CNZ GWC-001 events | NEEDS_DIRECTIVE | — | CNZ GWC-001 |
| RRR-P3-003 | REMOVED — Diamond Concierge earns 0 points | RETIRED | — | CEO Decision 3 |
| RRR-P3-004 | GGS webhook integration points (receive-ready, hold logic deferred) | NEEDS_DIRECTIVE | — | CEO Decision 5 |
| RRR-P3-005 | Room-Heat Inferno bonus multiplier: tipped + present + active within 30min. Value merchant-configurable via inferno_multiplier field on EarnRateConfig | NEEDS_DIRECTIVE | — | CEO Decision 4 + B1 |
| RRR-P3-006 | Micro top-up earn event ingest from CNZ | NEEDS_DIRECTIVE | — | Spec Section 10 |
| RRR-P3-007 | Pre-checkout RRR API call — available points, earn preview, partial redemption choice | NEEDS_DIRECTIVE | — | CEO note C3 |
| RRR-P3-008 | Cross-merchant redemption: 1:1 default, configurable via MerchantPairConfig | NEEDS_DIRECTIVE | — | CEO Decision B4 |
| RRR-P3-009 | GGS pre-payment coordination: RRR quote surfaced to consumer before processor call | NEEDS_DIRECTIVE | — | CEO note C3 |

---

## P4 — CLEANUP AND QUALITY

| ID | Requirement | Status | Directive | Notes |
|----|-------------|--------|-----------|-------|
| RRR-P4-001 | Execute CLEANUP.md checklist | NEEDS_DIRECTIVE | — | Remaining items: media, social, commerce, discovery |
| RRR-P4-002 | MongoDB session transactions full implementation with integration tests | NEEDS_DIRECTIVE | — | Full resolution of wallet.service.ts C1 |
| RRR-P4-003 | Replace any with typed FilterQuery in replay.ts:36 | NEEDS_DIRECTIVE | — | NoSQL injection risk |
| RRR-P4-004 | Documentation consolidation: 28 root markdown files to ~8 | NEEDS_DIRECTIVE | — | Self-assessment M1 |
| RRR-P4-005 | Add .prettierrc | NEEDS_DIRECTIVE | — | Self-assessment M2 |
| RRR-P4-006 | Pre-commit hooks: husky + lint-staged | NEEDS_DIRECTIVE | — | Self-assessment H4 |
| RRR-P4-007 | Type splits: wallet/types.ts and services/types.ts | NEEDS_DIRECTIVE | — | Self-assessment H3 |
| RRR-P4-008 | Remove/archive archive/xxxchatnow-seed/ | NEEDS_DIRECTIVE | — | CEO Decision 1 |
| RRR-P4-009 | Fix garbled text in ROADMAP_AND_BACKLOG.md Milestone 2 | NEEDS_DIRECTIVE | — | LLM artifact |

---

## PIPELINE INFRASTRUCTURE

| ID | Requirement | Status | Directive |
|----|-------------|--------|-----------|
| PIPE-001 | PROGRAM_CONTROL directory structure | DONE | Bootstrap |
| PIPE-002 | .github/copilot-instructions.md | DONE | Bootstrap |
| PIPE-003 | CLAUDE.md | DONE | Bootstrap |
| PIPE-004 | directive-intake.yml | DONE | Bootstrap |
| PIPE-005 | directive-dispatch.yml | DONE | Bootstrap |
| PIPE-006 | auto-merge.yml | DONE | Bootstrap |
| PIPE-007 | docs/DOMAIN_GLOSSARY.md | DONE | Bootstrap |
| PIPE-008 | docs/REQUIREMENTS_MASTER.md (this file) | DONE | Bootstrap |
| PIPE-009 | docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md | DONE | Bootstrap |

---

*Maintained by: Claude Chat (architecture) + Copilot/Claude Code (execution)*
*Update this file as part of every directive report-back commit.*
*CEO authority: Kevin B. Hartley — OmniQuest Media Inc.*

Commit message:
CHORE: Create docs/REQUIREMENTS_MASTER.md — live requirements registry

---

STEP 9 — Create docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

Create docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md with the following content exactly.

# RedRoomRewards — CEO Decisions Final Record
**Date:** 2026-04-17
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Status:** ALL DECISIONS LOCKED — full engineering ground truth

---

## D1 — Slot Machine: RETIRED
Slot machine and chance-based game logic is retired. Archive or remove from repo.
- SLOT_MACHINE_BRIEFING.md: archive or delete
- docs/specs/SLOT_MACHINE_SPEC_v1.0.md: archive or delete
- All slot machine code paths in src/: remove
- archive/xxxchatnow-seed/: remove

## D2 — Primary Tenant: ChatNow.Zone
ChatNow.Zone is the canonical platform name. ChatNow.Zone is merchant tenant 1. RedRoomPleasures and Cyrano onboard first (Phase 1).
ChatNow.Zone is Phase 2 with full CNZ integration.

## D3 — Diamond Concierge Earn: Zero Points
Diamond Concierge purchases earn 0 RRR points.
The discount is built into Diamond pricing.
RRR points CAN be burned (applied) against a Diamond purchase.
No earn event fires on Diamond Concierge transactions.
RRR-P3-003 is REMOVED from build scope.

## D4 — Room-Heat Inferno Bonus Multiplier: Configurable + Guardrails
Inferno bonus earn multiplier is active when ALL THREE conditions are met:
1. Guest has tipped during the session
2. Guest remains in the room
3. Tip activity not idle for more than 30 minutes
Multiplier value: merchant-configurable via inferno_multiplier field on EarnRateConfig.
Merchants must set this value explicitly — cannot be null at activation.

## D5 — GGS Integration: Deferred
GGS (GateGuard Sentinel) is CNZ's pre-payment welfare and fraud scoring layer.
RRR should build webhook-ready integration points to receive GGS signals.
Hold logic (blocking earn on COOL_DOWN/HARD_DECLINE): deferred until directed.

---

## B1 — Inferno Multiplier Value
DECISION: Merchant-configurable. No platform default.
Each merchant sets inferno_multiplier on EarnRateConfig during onboarding.
Value required before program activation — RRR rep validates.

## B2 — Tier Structure: Dual Layer
Layer 1 — Merchant tier (launch): merchant defines customer tiers.
  Earn rates, redemption caps, promo eligibility configurable per merchant tier.
Layer 2 — RRR member tier (future): cross-merchant platform tier.
  Architecture must support it from Day 1. Do not build for launch.
  IdentityLink carries merchant_tier (required).
  LoyaltyAccount carries rrr_member_tier (nullable at launch).

## B3 — Launch Sequence
Phase 1: RedRoomPleasures + Cyrano (first merchants — operational learning)
Phase 2: ChatNow.Zone (full CNZ/RRR integration after Phase 1 learning)

## B4 — Cross-Merchant Exchange Rate: 1:1 Default, Configurable Architecture
Launch value: 1:1 (1 RRR point at Merchant A = 1 RRR point at Merchant B).
Architecture must support configurable per-merchant-pair rates in future.
Implementation: cross_merchant_exchange_rate field on MerchantPairConfig model, default 1.0.
Ledger records the rate at time of redemption (append-only — historical records unaffected).
Future research required: standard coalition loyalty reconciliation patterns (Air Miles,
Amex Membership Rewards, etc.) — inter-merchant liability, float, and reconciliation design.

## B5 — Tier-Based Redemption Caps: Merchant-Configurable
No platform defaults. Each merchant sets max_discount_percent per tier in TierCapConfig.
Configurable placeholders for testing (replace with real numbers before testing begins):
  PLATINUM: max_discount_percent = 50.0
  GOLD:     max_discount_percent = 35.0
  SILVER:   max_discount_percent = 20.0
  MEMBER:   max_discount_percent = 10.0
  GUEST:    max_discount_percent = 5.0

---

## EXPANDED VISION (CEO Note — All Locked as Requirements)

RRR operates as a standalone SaaS loyalty engine offered via API to merchant partners.
Not embedded in any single product.

Merchant requirements:
- Merchant login and reporting surface (web-based)
- Merchant account managed by an RRR account representative
- All custom earn/burn programs require RRR account rep authorization before activation

Consumer member requirements:
- Consumer login surface (web-based)
- Cross-merchant balance visibility
- Cross-merchant redemption — zero friction at checkout

Template types required:
- Standard earn/burn templates (pre-built, merchant selects)
- Customizable earn/burn templates (merchant configures within guardrails, rep authorizes)
- Couponing (discount codes triggering point bonuses or redemption unlocks)
- Points with purchase (standard earn)
- Added bonus on specific products (product-level earn multiplier)
- Redemption windows (time-limited periods where burn ratios improve)
- Customer segmentation (attach any promotion to a defined member segment)
- General communications (segment-targeted email/in-app messages)

Pre-checkout requirements (RRR API called before payment processor):
- Consumer sees how many points are available to apply to this purchase
- Consumer sees how many points they will earn from this purchase
- Consumer can choose a custom amount to apply (not forced to use system recommendation)
- Resulting price shown after redemption applied
- Coordinated with GateGuard Sentinel pre-payment processing (single coherent view)

Governance: all RRR build must adhere to OmniQuest Media Inc. Canonical Corpus
as minimum standard for governance, safety, and security.

---

*Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc. — 2026-04-17*

Commit message:
CHORE: Create docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md — locked CEO decisions record

---

FINAL STEP — Open PR

After all 9 commits are complete, open one PR targeting main.
Title: CHORE: Bootstrap Program Control pipeline — RRR
Body: Bootstrap complete. 9 files created establishing autonomous
build pipeline for RedRoomRewards. Copilot and Claude Code can now
self-direct using PROGRAM_CONTROL/DIRECTIVES/QUEUE/ and
docs/REQUIREMENTS_MASTER.md.
Labels: copilot-task, ready-for-review

When your work is complete, create a pull request targeting main.

