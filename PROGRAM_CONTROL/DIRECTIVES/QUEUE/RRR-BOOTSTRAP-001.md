# DIRECTIVE: RRR-BOOTSTRAP-001

**Date:** 2026-04-17
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Agent:** COPILOT
**FIZ:** NO
**Commit Prefix:** CHORE
**Branch:** chore/program-control-bootstrap
**PR Title:** CHORE: Install Program Control pipeline — bootstrap RRR-BOOTSTRAP-001
**Parallel-safe:** YES
**Touches:** CLAUDE.md, .github/copilot-instructions.md, .github/workflows/directive-intake.yml, .github/workflows/directive-dispatch.yml, .github/workflows/auto-merge.yml, docs/DOMAIN_GLOSSARY.md, docs/REQUIREMENTS_MASTER.md, docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md, PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep, PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep, PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep, PROGRAM_CONTROL/REPORT_BACK/.gitkeep, PROGRAM_CONTROL/BACKLOGS/.gitkeep, PROGRAM_CONTROL/CLEARANCES/.gitkeep

---

## Objective

Install the complete Program Control pipeline and all missing bootstrap files
required before any build directives can be queued. No production code is
touched. This is infrastructure and documentation only.

---

## Files to CREATE (do not overwrite existing files)

### 1. PROGRAM_CONTROL directory structure

Create these empty marker files to establish the directory tree:

- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep`
- `PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep`
- `PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep`
- `PROGRAM_CONTROL/REPORT_BACK/.gitkeep`
- `PROGRAM_CONTROL/BACKLOGS/.gitkeep`
- `PROGRAM_CONTROL/CLEARANCES/.gitkeep`

### 2. `CLAUDE.md` (root)

See `docs/commit to main as docs/BOOTSTRAP_INSTRUCTIONS.md` STEP 3 for exact content.

Format:

```
# CLAUDE.md — RedRoomRewards
**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Repo:** OmniQuestMediaInc/RedRoomRewards
**Date:** 2026-04-17
```

Role, Stack, Commit Prefix Enum, FIZ Commit Format, Autonomous Directive Protocol,
HARD_STOP conditions, Key File Paths.

### 3. `.github/copilot-instructions.md`

Program Control agent instructions (always-on). See BOOTSTRAP_INSTRUCTIONS.md STEP 2
for exact content.

### 4. `.github/workflows/directive-intake.yml`

Auto-opens a GitHub Issue when a new `.md` file is pushed to
`PROGRAM_CONTROL/DIRECTIVES/QUEUE/`. See BOOTSTRAP_INSTRUCTIONS.md STEP 4.

### 5. `.github/workflows/directive-dispatch.yml`

Routes issues to the correct agent, manages QUEUE → IN_PROGRESS → DONE lifecycle,
and detects file-path conflicts between queued directives.
See BOOTSTRAP_INSTRUCTIONS.md STEP 5.

### 6. `.github/workflows/auto-merge.yml`

Enables squash auto-merge on every PR targeting main once CI is green.
See BOOTSTRAP_INSTRUCTIONS.md STEP 6.

### 7. `docs/DOMAIN_GLOSSARY.md`

Canonical naming authority for all code, comments, and docs.
See BOOTSTRAP_INSTRUCTIONS.md STEP 7.

### 8. `docs/REQUIREMENTS_MASTER.md`

Live requirements registry with status tracking.
See BOOTSTRAP_INSTRUCTIONS.md STEP 8.

### 9. `docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md`

Locked CEO decisions record.
See BOOTSTRAP_INSTRUCTIONS.md STEP 9.

---

## Invariants

- Do NOT modify any existing source code in `src/` or `api/`
- Do NOT modify `COPILOT_INSTRUCTIONS.md`
- Do NOT modify any existing `.github/workflows/` files
- Do NOT change the package manager (npm only)
- Create only the files listed above — nothing else
