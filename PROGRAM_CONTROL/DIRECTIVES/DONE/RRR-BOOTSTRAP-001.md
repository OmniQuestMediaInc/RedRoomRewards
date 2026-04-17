# DIRECTIVE: RRR-BOOTSTRAP-001
**Directive ID:** RRR-BOOTSTRAP-001
**Date:** 2026-04-17
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Agent:** COPILOT
**FIZ:** NO
**Commit Prefix:** CHORE
**Branch:** chore/program-control-bootstrap
**PR Title:** CHORE: Install Program Control pipeline — RRR-BOOTSTRAP-001
**Parallel-safe:** NO — must land on main before any other directive

---

## Copilot Execution Instructions

Read this directive fully before writing any code.
Execute all steps in order. Do not skip any file.
Do not touch any file under src/.
FIZ: NO — no financial code is modified.
Open one PR to main on completion.
File report-back to PROGRAM_CONTROL/REPORT_BACK/RRR-BOOTSTRAP-001-report.md.

---

## Step 1 — Create PROGRAM_CONTROL directory structure

Create the following empty files (content: blank — they exist only to
establish the directory tree in git):

  PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/BACKLOGS/.gitkeep
  PROGRAM_CONTROL/REPORT_BACK/.gitkeep

---

## Step 2 — Create CLAUDE.md at repo root

File path: CLAUDE.md

Content:

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

## Stack

- Runtime: Node.js + TypeScript (strict)
- Database: MongoDB + Mongoose (no Prisma)
- Package manager: npm (not Yarn — never use yarn commands)
- Test runner: Jest
- Build: npm run build
- Type check: npx tsc --noEmit
- Lint: npm run lint

---

## Commit Prefix Enum (RRR — authoritative)

| Prefix | Scope                                              |
|--------|----------------------------------------------------|
| FIZ    | Financial Integrity Zone: ledger, wallet, escrow   |
| DB     | Database models, Mongoose schemas, indexes         |
| API    | Controllers, routes, OpenAPI contract              |
| SVC    | Service layer (non-financial)                      |
| INFRA  | Workflows, CI, config, infrastructure              |
| UI     | Frontend or dashboard (future)                     |
| GOV    | Governance, policy, agent instruction docs         |
| TEST   | Test files only                                    |
| CHORE  | Maintenance, cleanup, non-code tasks               |

Do NOT use: feat / fix / docs / refactor — not valid RRR prefixes.

---

## FIZ Commit Body Format (required when prefix = FIZ)

FIZ: <short description>

REASON: <why this change is necessary>
IMPACT: <what balances/ledger/escrow behaviour changes>
CORRELATION_ID: <directive ID or ticket>

---

## Financial Integrity Rules (non-negotiable)

- All point movements through LedgerService — no direct Wallet mutations
- All financial operations require idempotency_key
- Ledger entries are append-only — no UPDATE or DELETE on ledger_entries
- correlation_id and reason_code required on all ledger entries
- Wallet mutations use MongoDB sessions (startSession) once available;
  until then use existing optimistic lock pattern in wallet.service.ts
- No hardcoded balances anywhere in production code paths
- No backdoors, master passwords, or unauthorized settlement behaviour

---

## Directive Execution Protocol

1. Read directive fully before writing any code
2. Check Touches list — confirm no overlap with IN_PROGRESS directives
3. Execute exactly what is specified — do not invent scope
4. Run npm run build and npm test before committing
5. One PR per directive
6. File report-back to PROGRAM_CONTROL/REPORT_BACK/<DIRECTIVE_ID>-report.md
7. Report-back format: STATUS / FILES_CHANGED / TEST_RESULTS / NOTES

---

## Hard Stops — file BLOCKED report-back and halt immediately

- FIZ file has a merge conflict
- Directive asks for direct wallet balance mutations
- Directive asks for UPDATE or DELETE on ledger_entries
- Build or tests fail after implementation attempt
- Any ambiguity in directive scope

Do not guess. Do not proceed past a Hard Stop without human clearance.

---

## Key File Paths

| Purpose             | Path                                        |
|---------------------|---------------------------------------------|
| Ledger service      | src/ledger/ledger.service.ts                |
| Wallet service      | src/wallets/wallet.service.ts               |
| Wallet controller   | src/api/wallet.controller.ts                |
| DB models           | src/db/models/                              |
| Service layer       | src/services/                               |
| API controllers     | src/api/                                    |
| Requirements master | docs/REQUIREMENTS_MASTER.md                 |
| Domain glossary     | docs/DOMAIN_GLOSSARY.md                     |
| CEO decisions       | docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md  |
| RRR spec            | docs/RRR_LOYALTY_ENGINE_SPEC_v1.1.md        |
| Queue               | PROGRAM_CONTROL/DIRECTIVES/QUEUE/           |
| In progress         | PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/     |
| Done                | PROGRAM_CONTROL/DIRECTIVES/DONE/            |
| Backlogs            | PROGRAM_CONTROL/DIRECTIVES/BACKLOGS/        |
| Report-backs        | PROGRAM_CONTROL/REPORT_BACK/                |

---

## Step 3 — Create .github/copilot-instructions.md

File path: .github/copilot-instructions.md

Content:

# GitHub Copilot Instructions — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Date:** 2026-04-17

---

## Primary Reference Files — read in this order before acting

1. COPILOT_INSTRUCTIONS.md — full coding rules (root)
2. COPILOT_GOVERNANCE.md — repository governance (root)
3. docs/DOMAIN_GLOSSARY.md — naming authority
4. docs/REQUIREMENTS_MASTER.md — full requirements
5. docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md — locked CEO decisions

---

## Stack

- Node.js + TypeScript strict
- MongoDB + Mongoose (no Prisma, no SQL)
- npm only — do NOT use yarn commands
- Jest for tests
- npm run build | npm run lint | npm test

---

## Commit Prefix Enum (RRR — use exactly these values)

FIZ | DB | API | SVC | INFRA | UI | GOV | TEST | CHORE

Do NOT use: feat | fix | docs | refactor — not valid RRR prefixes.

---

## FIZ Gate

Any commit touching these paths requires FIZ prefix and a commit body
with REASON: / IMPACT: / CORRELATION_ID:

  src/ledger/
  src/wallets/
  src/services/point-accrual.service.ts
  src/services/point-redemption.service.ts
  src/services/point-expiration.service.ts
  src/api/wallet.controller.ts

---

## Program Control Protocol

Directives arrive in:  PROGRAM_CONTROL/DIRECTIVES/QUEUE/
Move to IN_PROGRESS/   when starting work
Move to DONE/          after PR merges
File report-back to    PROGRAM_CONTROL/REPORT_BACK/

One PR per directive.
Branch naming: <prefix-lowercase>/<directive-id-lowercase>
Example: fiz/rrr-p0-001

---

## Hard Prohibitions

- No direct wallet balance mutations (all through LedgerService)
- No UPDATE or DELETE on ledger_entries collection
- No hardcoded balance values (const previousBalance = 1000 is a P0 bug)
- No yarn commands
- No Prisma
- No legacy code from archive/xxxchatnow-seed/
- No slot machine code (D1 RETIRED)
- No XXXChatNow.com references (D2 — use ChatNow.Zone)
- Diamond purchases earn 0 RRR points (D3)

---

## Step 4 — Create .github/workflows/directive-intake.yml

File path: .github/workflows/directive-intake.yml

Content:

name: Directive Intake

on:
  push:
    branches: [main]
    paths:
      - 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/**'

jobs:
  intake:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect new directives in QUEUE
        id: detect
        run: |
          NEW_FILES=$(git diff --name-only HEAD~1 HEAD \
            -- 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/' \
            | grep -v '.gitkeep' || true)
          echo "new_files<<EOF" >> $GITHUB_OUTPUT
          echo "$NEW_FILES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          if [ -n "$NEW_FILES" ]; then
            echo "has_directives=true" >> $GITHUB_OUTPUT
          else
            echo "has_directives=false" >> $GITHUB_OUTPUT
          fi

      - name: Log intake
        if: steps.detect.outputs.has_directives == 'true'
        run: |
          echo "=== DIRECTIVE INTAKE ==="
          echo "New directives detected:"
          echo "${{ steps.detect.outputs.new_files }}"

      - name: Validate directive format
        if: steps.detect.outputs.has_directives == 'true'
        run: |
          for f in ${{ steps.detect.outputs.new_files }}; do
            echo "Validating: $f"
            if [ ! -f "$f" ]; then
              echo "WARNING: File not found: $f"
              continue
            fi
            for field in "Agent:" "FIZ:" "Directive ID:"; do
              if ! grep -q "$field" "$f"; then
                echo "WARNING: Missing field '$field' in $f"
              fi
            done
          done

---

## Step 5 — Create .github/workflows/directive-dispatch.yml

File path: .github/workflows/directive-dispatch.yml

Content:

name: Directive Dispatch

on:
  push:
    branches: [main]
    paths:
      - 'PROGRAM_CONTROL/DIRECTIVES/QUEUE/**'
  workflow_dispatch:

jobs:
  dispatch:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Scan QUEUE for directives
        id: scan
        run: |
          QUEUE_DIR="PROGRAM_CONTROL/DIRECTIVES/QUEUE"
          DIRECTIVES=$(find "$QUEUE_DIR" -type f ! -name '.gitkeep' 2>/dev/null || true)
          if [ -z "$DIRECTIVES" ]; then
            echo "No directives in queue."
            echo "has_work=false" >> $GITHUB_OUTPUT
          else
            echo "has_work=true" >> $GITHUB_OUTPUT
            echo "directives<<EOF" >> $GITHUB_OUTPUT
            echo "$DIRECTIVES" >> $GITHUB_OUTPUT
            echo "EOF" >> $GITHUB_OUTPUT
          fi

      - name: Conflict detection against IN_PROGRESS
        if: steps.scan.outputs.has_work == 'true'
        run: |
          IN_PROGRESS="PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS"
          echo "=== CONFLICT DETECTION ==="
          ALL_TOUCHES=""
          for f in $(find "$IN_PROGRESS" -type f ! -name '.gitkeep' 2>/dev/null); do
            TOUCHES=$(grep "^Touches:" "$f" 2>/dev/null || true)
            if [ -n "$TOUCHES" ]; then
              ALL_TOUCHES="$ALL_TOUCHES $TOUCHES"
            fi
          done
          for q in $(find "PROGRAM_CONTROL/DIRECTIVES/QUEUE" \
              -type f ! -name '.gitkeep' 2>/dev/null); do
            Q_TOUCHES=$(grep "^Touches:" "$q" 2>/dev/null \
              | sed 's/Touches://' || true)
            for touch in $Q_TOUCHES; do
              if echo "$ALL_TOUCHES" | grep -q "$touch"; then
                echo "CONFLICT: $q touches $touch which is IN_PROGRESS"
                echo "Human review required before dispatch."
              fi
            done
          done

      - name: Route by Agent field
        if: steps.scan.outputs.has_work == 'true'
        run: |
          for directive in ${{ steps.scan.outputs.directives }}; do
            AGENT=$(grep "^\*\*Agent:\*\*" "$directive" 2>/dev/null \
              | awk '{print $2}' || \
              grep "^Agent:" "$directive" 2>/dev/null \
              | awk '{print $2}' || echo "UNKNOWN")
            DIRECTIVE_ID=$(grep "Directive ID:" "$directive" 2>/dev/null \
              | head -1 | awk '{print $NF}' || echo "UNKNOWN")
            FIZ=$(grep "^\*\*FIZ:\*\*" "$directive" 2>/dev/null \
              | awk '{print $2}' || \
              grep "^FIZ:" "$directive" 2>/dev/null \
              | awk '{print $2}' || echo "NO")

            echo "=== ROUTING ==="
            echo "Directive: $DIRECTIVE_ID"
            echo "Agent:     $AGENT"
            echo "FIZ:       $FIZ"

            case "$AGENT" in
              CLAUDE_CODE) echo "Route: Claude Code agent" ;;
              COPILOT)     echo "Route: GitHub Copilot agent" ;;
              *) echo "ERROR: Unknown agent '$AGENT'. Valid: CLAUDE_CODE | COPILOT" ;;
            esac

            if [ "$FIZ" = "YES" ]; then
              echo "FIZ FLAG: Human review required on PR before merge."
            fi
          done

---

## Step 6 — Create .github/workflows/auto-merge.yml

File path: .github/workflows/auto-merge.yml

Content:

name: Auto Merge

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Check PR eligibility
        id: eligibility
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_NUMBER="${{ github.event.pull_request.number }}"
          if [ -z "$PR_NUMBER" ]; then
            echo "No PR number — skipping."
            echo "eligible=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          LABELS=$(gh pr view "$PR_NUMBER" --json labels \
            --jq '.labels[].name' 2>/dev/null || true)
          if echo "$LABELS" | grep -q "fiz"; then
            echo "FIZ label — auto-merge BLOCKED. Human review required."
            echo "eligible=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          IS_DRAFT=$(gh pr view "$PR_NUMBER" --json isDraft \
            --jq '.isDraft' 2>/dev/null || echo "true")
          if [ "$IS_DRAFT" = "true" ]; then
            echo "Draft PR — skipping."
            echo "eligible=false" >> $GITHUB_OUTPUT
            exit 0
          fi
          echo "eligible=true" >> $GITHUB_OUTPUT

      - name: Enable auto-merge (squash)
        if: steps.eligibility.outputs.eligible == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_NUMBER="${{ github.event.pull_request.number }}"
          gh pr merge "$PR_NUMBER" --auto --squash --delete-branch \
            || echo "Auto-merge pending — checks may not have completed yet."

---

## Step 7 — Create .github/workflows/ci.yml

File path: .github/workflows/ci.yml

Content:

name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: TypeScript type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

---

## Step 8 — Create docs/REQUIREMENTS_MASTER.md

File path: docs/REQUIREMENTS_MASTER.md

Content:

# Requirements Master — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Date:** 2026-04-17
**Version:** 1.0

---

## Platform Identity

- Platform: RedRoomRewards (RRR)
- Phase 1 merchants: RedRoomPleasures, Cyrano
- Phase 2 merchant: ChatNow.Zone (not XXXChatNow.com — see D2)
- RRR operates as SaaS: API to merchants, merchant portal, consumer portal

---

## CEO Decisions — All Locked 2026-04-17

D1 — Slot Machine: RETIRED
Remove SLOT_MACHINE_BRIEFING.md, docs/specs/SLOT_MACHINE_SPEC_v1.0.md,
all slot machine code paths, and archive/xxxchatnow-seed/.

D2 — Platform name: ChatNow.Zone
All XXXChatNow.com references replaced with ChatNow.Zone repo-wide.

D3 — Diamond Concierge: Zero earn points
Diamond purchases earn 0 RRR points. Burn eligible. RRR-P3-003 REMOVED.

D4 — Room-Heat Inferno Bonus: Configurable + Guardrails
Active when: guest tipped + still in room + tip not idle >30 minutes.
Value: merchant-configurable via inferno_multiplier on EarnRateConfig.

D5 — GGS Integration: Deferred
Build webhook-ready receive endpoints. Hold logic deferred.

B1 — inferno_multiplier: required field on EarnRateConfig, no default.
B2 — Dual tier: merchant_tier (launch) + rrr_member_tier (future, nullable).
B3 — Launch: Phase 1 = RedRoomPleasures + Cyrano; Phase 2 = ChatNow.Zone.
B4 — Cross-merchant rate: 1:1 default via MerchantPairConfig.
B5 — Redemption caps via TierCapConfig.
     Placeholders: PLATINUM 50% / GOLD 35% / SILVER 20% / MEMBER 10% / GUEST 5%

---

## Expanded Vision (all locked as requirements)

- Earn/burn template library (standard + customizable, rep auth required)
- Cross-merchant redemption: zero friction at checkout
- Partial redemption: consumer chooses amount
- Tier-based redemption caps
- Promo engine: couponing, redemption windows, product-level rules, segmentation
- Communications: segment-targeted email/in-app

---

## Build State as of 2026-04-17

BUILT:
  src/ledger/ledger.service.ts — LedgerService (append-only)
  src/wallets/wallet.service.ts — WalletService (partial, optimistic lock)
  src/wallets/ — EscrowService
  src/services/point-accrual.service.ts — PointAccrualService (partial)
  src/services/point-redemption.service.ts — PointRedemptionService (partial)
  src/services/point-expiration.service.ts — PointExpirationService (partial)
  src/db/models/ledger-entry.model.ts
  src/db/models/wallet.model.ts
  src/db/models/model-wallet.model.ts
  src/db/models/escrow-item.model.ts

BROKEN — P0:
  src/api/wallet.controller.ts
  Lines 131 + 186: const previousBalance = 1000
  Hardcoded placeholder — returns fake balances in production.
  Fix before all else (see directive RRR-P0-001).

MISSING:
  src/db/models/point-lot.model.ts
  LoyaltyAccount model
  IdentityLink model
  Config tables: ValuationConfig, EarnRateConfig, TierCapConfig,
                 MicroTopupConfig, SpendOrderConfig

---

## Financial Integrity Rules

- Append-only LedgerService — no UPDATE/DELETE on ledger_entries
- All point movements through LedgerService — no direct Wallet updates
- All financial operations require idempotency_key
- correlation_id and reason_code on all ledger entries
- FIZ commit format: REASON: / IMPACT: / CORRELATION_ID: required
- No hardcoded balance values

---

## Commit Prefix Enum (authoritative)

FIZ | DB | API | SVC | INFRA | UI | GOV | TEST | CHORE

---

## Step 9 — Create docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

File path: docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md

Content:

# RRR CEO Decisions — Final
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Date:** 2026-04-17
**Status:** LOCKED — all build directives may proceed without further CEO input

---

D1 — Slot Machine: RETIRED
Remove: SLOT_MACHINE_BRIEFING.md, docs/specs/SLOT_MACHINE_SPEC_v1.0.md,
all slot machine code paths, archive/xxxchatnow-seed/.

D2 — Platform Name: ChatNow.Zone
All XXXChatNow.com replaced with ChatNow.Zone.
Scope: docs, comments, configs, model defaults, openapi.yaml.
ChatNow.Zone is Phase 2 merchant only.

D3 — Diamond Concierge: Zero Earn Points
Diamond purchases earn 0 (zero) RRR points.
Burn (redemption) at Diamond tier is eligible.
RRR-P3-003 is REMOVED from scope entirely.

D4 — Room-Heat Inferno Bonus: Configurable + Guardrails
Activates when ALL of:
  - Guest has tipped in the current room session
  - Guest is still present in the room
  - Most recent tip not idle >30 minutes
Value: merchant-configurable via inferno_multiplier on EarnRateConfig.
Required field — no system default — merchants must set explicitly.

D5 — GGS Integration: Deferred
Build webhook-ready receive endpoints for GGS events.
Business logic for GGS hold/release is deferred. Do not implement logic.

---

B1 — Inferno Multiplier
inferno_multiplier is a required field on EarnRateConfig.
Merchant-configurable. No system default.

B2 — Dual Tier System
merchant_tier — active at launch, required field.
rrr_member_tier — future, nullable, not enforced at launch.

B3 — Launch Sequence
Phase 1: RedRoomPleasures + Cyrano
Phase 2: ChatNow.Zone
No Phase 1/2 conditional logic in code — merchant records control routing.

B4 — Cross-Merchant Rate
Default 1:1 earn/burn ratio across merchants.
Configurable per merchant pair via MerchantPairConfig.

B5 — Redemption Caps
Merchant-configurable via TierCapConfig.
Testing placeholders (not production values):
  PLATINUM 50% / GOLD 35% / SILVER 20% / MEMBER 10% / GUEST 5%

---

Signed: Kevin B. Hartley, CEO — OmniQuest Media Inc. — 2026-04-17

---

## Step 10 — Create docs/DOMAIN_GLOSSARY.md

File path: docs/DOMAIN_GLOSSARY.md

Content:

# Domain Glossary — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Date:** 2026-04-17
**Status:** Naming authority — all identifiers must match this glossary

---

## Core Entities

Term              | Definition
------------------|------------------------------------------------------------
RRR               | RedRoomRewards — the loyalty platform
LedgerEntry       | Immutable record of a single point movement
Wallet            | Per-consumer point balance record
ModelWallet       | Per-model promo point balance record
EscrowItem        | Points held pending confirmation
PointLot          | A batch of points with its own expiry and source event
LoyaltyAccount    | Cross-merchant consumer identity record
IdentityLink      | Link between a platform user ID and a LoyaltyAccount

## Config Entities

Term              | Definition
------------------|------------------------------------------------------------
ValuationConfig   | Dollar-to-point conversion rate
EarnRateConfig    | Earn rate rules per merchant/tier; inferno_multiplier required
TierCapConfig     | Redemption cap percentages per tier per merchant
MicroTopupConfig  | Rules for micro top-up earn events
SpendOrderConfig  | Order in which PointLots are consumed on redemption
MerchantPairConfig| Cross-merchant earn/burn rate configuration

## Tiers

Term              | Definition
------------------|------------------------------------------------------------
merchant_tier     | Merchant-assigned tier — active at launch
rrr_member_tier   | RRR global tier — future, nullable at launch
PLATINUM          | Highest tier — 50% redemption cap (placeholder)
GOLD              | 35% redemption cap (placeholder)
SILVER            | 20% redemption cap (placeholder)
MEMBER            | 10% redemption cap (placeholder)
GUEST             | Lowest tier — 5% redemption cap (placeholder)

## Merchant / Platform Names

Term              | Definition
------------------|------------------------------------------------------------
RedRoomPleasures  | Phase 1 merchant
Cyrano            | Phase 1 merchant (voice/text roleplay)
ChatNow.Zone      | Phase 2 merchant — NOT XXXChatNow.com
Diamond Concierge | Premium service: 0 earn points, eligible to burn

## Earn Events

Term              | Definition
------------------|------------------------------------------------------------
Inferno Bonus     | Multiplier: guest tips + stays in room + tip not idle >30m
inferno_multiplier| Required field on EarnRateConfig — merchant-set, no default

## Financial Operations

Term   | Definition
-------|-------------------------------------------------------------
credit | Add points to wallet via LedgerService
debit  | Remove points from wallet via LedgerService
escrow | Hold points pending confirmation
release| Confirm escrowed points to available balance
refund | Return escrowed points to available balance
expiry | Scheduled removal of points past expires_at

## Commit Prefix Enum (authoritative)

Prefix | Scope
-------|--------------------------------------------------------------
FIZ    | Financial Integrity Zone: ledger, wallet, balance, escrow
DB     | Database models, Mongoose schemas, indexes
API    | Controllers, routes, OpenAPI contract
SVC    | Service layer (non-financial)
INFRA  | Workflows, CI, config, infrastructure
UI     | Frontend, dashboard (future)
GOV    | Governance, policy, agent instruction documents
TEST   | Test files only
CHORE  | Maintenance, cleanup, non-code tasks

## Agent Identifiers

Identifier   | Agent
-------------|------------------------------------------
CLAUDE_CODE  | Claude Code autonomous execution agent
COPILOT      | GitHub Copilot autonomous execution agent

## Program Control States

State       | Path
------------|----------------------------------------------
QUEUE       | PROGRAM_CONTROL/DIRECTIVES/QUEUE/
IN_PROGRESS | PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/
DONE        | PROGRAM_CONTROL/DIRECTIVES/DONE/
BACKLOGS    | PROGRAM_CONTROL/DIRECTIVES/BACKLOGS/

---

## Step 11 — Patch governance docs (enum corrections only)

Read each of these files. Find any section defining commit message types
or commit prefixes. If the section lists feat / fix / docs / refactor as
commit types, replace that section with the authoritative RRR enum below.
Make no other changes. If the enum is already correct, leave the file alone.

Files to check:
  COPILOT_INSTRUCTIONS.md
  COPILOT_GOVERNANCE.md
  COPILOT_EXECUTION_RULES.md

Authoritative RRR commit prefix enum to use as replacement:

  FIZ | DB | API | SVC | INFRA | UI | GOV | TEST | CHORE

  FIZ   — Financial Integrity Zone: ledger, wallet, balance, escrow
  DB    — Database models, Mongoose schemas, indexes
  API   — Controllers, routes, OpenAPI contract
  SVC   — Service layer (non-financial)
  INFRA — Workflows, CI, config, infrastructure
  UI    — Frontend, dashboard (future)
  GOV   — Governance, policy, agent instruction documents
  TEST  — Test files only
  CHORE — Maintenance, cleanup, non-code tasks

---

## Touches

CLAUDE.md
.github/copilot-instructions.md
.github/workflows/directive-intake.yml
.github/workflows/directive-dispatch.yml
.github/workflows/auto-merge.yml
.github/workflows/ci.yml
PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep
PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep
PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep
PROGRAM_CONTROL/DIRECTIVES/BACKLOGS/.gitkeep
PROGRAM_CONTROL/REPORT_BACK/.gitkeep
docs/REQUIREMENTS_MASTER.md
docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md
docs/DOMAIN_GLOSSARY.md
COPILOT_INSTRUCTIONS.md (patch enum section only)
COPILOT_GOVERNANCE.md (patch enum section only)
COPILOT_EXECUTION_RULES.md (patch enum section only)

---

## PR Checklist

- [ ] PROGRAM_CONTROL/ directory tree created with .gitkeep files
- [ ] CLAUDE.md at repo root with correct RRR enum
- [ ] .github/copilot-instructions.md with correct RRR enum
- [ ] directive-intake.yml, directive-dispatch.yml, auto-merge.yml, ci.yml all valid YAML
- [ ] docs/REQUIREMENTS_MASTER.md includes all D/B decisions and build state
- [ ] docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md dated 2026-04-17, all decisions present
- [ ] docs/DOMAIN_GLOSSARY.md present with full entity and enum tables
- [ ] Governance docs patched if enum was wrong
- [ ] No files under src/ touched
- [ ] FIZ: NO confirmed
- [ ] npm run build passes (pre-existing errors exempt — introduce no new ones)

---

## Commit Message

CHORE: Install Program Control pipeline — RRR-BOOTSTRAP-001

Creates PROGRAM_CONTROL directory structure, CLAUDE.md,
.github/copilot-instructions.md, directive-intake/dispatch/
auto-merge/ci workflows, and authoritative docs:
REQUIREMENTS_MASTER.md, RRR_CEO_DECISIONS_FINAL_2026-04-17.md,
DOMAIN_GLOSSARY.md. Patches commit prefix enum in governance docs
if incorrect. No production code touched. FIZ: NO.
Unblocks all P0/P1 build directives.

---

## Report-Back Template

File to create after PR merges:
PROGRAM_CONTROL/REPORT_BACK/RRR-BOOTSTRAP-001-report.md

Content:
STATUS: COMPLETE
DIRECTIVE: RRR-BOOTSTRAP-001
DATE: <date of completion>
FILES_CHANGED: <list all files created or patched>
TEST_RESULTS: npm run build — PASS / FAIL, npm test — PASS / FAIL
NOTES: <any deviations or issues encountered>
