# GitHub Configuration and Workflows
# RedRoomRewards — OmniQuest Media Inc.

This directory contains GitHub-specific configuration files, workflows, and documentation for the RedRoomRewards repository.

## Directory Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── auto-merge.yml     # Automatic PR merge when checks pass
│   ├── codeql-analysis.yml # Security scanning
│   ├── lint.yml           # YAML, JSON, Markdown linting
│   └── pr-checks.yml      # PR conflict detection, build, and test checks
├── linters/               # Linter configuration files
│   ├── .markdownlint.yml # Markdown linting rules
│   └── .yaml-lint.yml    # YAML linting rules
├── copilot-instructions.md # GitHub Copilot agent instructions (to be created)
├── pull_request_template.md # Template for new PRs
├── PR_CONFLICT_RESOLUTION.md # Guide for resolving merge conflicts
├── PR_LIFECYCLE.md        # Complete PR lifecycle documentation
└── README.md             # This file
```

## Key Files

### Workflows

#### `auto-merge.yml`
Automatically enables auto-merge (squash) for all pull requests targeting main. PRs will merge automatically once:
- All required checks pass
- No merge conflicts exist
- (Optional) Required approvals obtained

**Triggers:** PR opened, synchronized, reopened

#### `pr-checks.yml`
Comprehensive PR validation including:
- **Merge conflict detection** - Checks if PR can merge cleanly with main
- **Build verification** - Runs `npm run build` and TypeScript compilation
- **Test execution** - Runs full test suite with coverage
- **Status comments** - Posts helpful comments when checks fail
- **Labels** - Adds `merge-conflict` label when conflicts detected
- **Merge readiness summary** - Final status check after all jobs complete

**Triggers:** PR opened, synchronized, reopened

#### `lint.yml`
Runs Super-Linter to validate:
- YAML files (workflows, configs)
- JSON files (package.json, tsconfig.json, etc.)
- Markdown documentation

**Triggers:** PR, push to main

#### `codeql-analysis.yml`
Security scanning using GitHub CodeQL to detect:
- Security vulnerabilities
- Code quality issues
- Potential bugs

**Triggers:** PR, push to main, weekly schedule

### Documentation

#### `pull_request_template.md`
Template automatically applied when creating new PRs. Includes:
- Summary and change type checkboxes
- Testing checklist
- Build status verification
- Financial Integrity Zone (FIZ) requirements
- Commit message convention reminders

#### `PR_CONFLICT_RESOLUTION.md`
Step-by-step guide for resolving merge conflicts:
- Conflict detection and identification
- Resolution procedures for developers and AI agents
- Handling different conflict types (code, config, docs)
- Special guidance for Financial Integrity Zone conflicts
- Git commands and best practices

#### `PR_LIFECYCLE.md`
Complete documentation of PR lifecycle:
- All stages from creation to merge
- Automated check descriptions
- Review and approval process
- Post-merge actions
- Troubleshooting guide
- Best practices for authors, reviewers, and AI agents

## Workflow Execution Flow

```
PR Created/Updated
    │
    ├─────────────────────────────────────┐
    │                                     │
    v                                     v
[pr-checks.yml]                    [lint.yml]
    │                                     │
    ├─ Check merge conflicts             ├─ Lint YAML
    ├─ Verify build passes               ├─ Lint JSON
    ├─ Run tests                         └─ Lint Markdown
    └─ Post status summary                    │
         │                                     │
         └─────────────┬──────────────────────┘
                       │
                       v
              [codeql-analysis.yml]
                       │
                       ├─ Security scan
                       └─ Code quality check
                             │
                             v
                    All checks complete
                             │
                             ├─ [IF ALL PASS]
                             │      │
                             │      v
                             │ [auto-merge.yml]
                             │      │
                             │      └─ Enable auto-merge
                             │         (squash when ready)
                             │
                             └─ [IF ANY FAIL]
                                    │
                                    └─ Comment on PR
                                       Add labels
                                       Block merge
```

## Pull Request Requirements

### Standard PR Requirements

- ✅ All automated checks pass (pr-checks, lint, codeql)
- ✅ No merge conflicts with main
- ✅ Build succeeds (`npm run build`)
- ✅ Tests pass (`npm test`)
- ✅ Code follows linting rules

### FIZ-Scoped PR Requirements (Financial Integrity Zone)

**Additional requirements for PRs touching:**
- `src/ledger/ledger.service.ts`
- `src/wallets/wallet.service.ts`
- Any code affecting point balances or financial calculations

Must have:
- ✅ All standard requirements
- ✅ **Human review and approval** (required, not optional)
- ✅ Label: `fiz-review-required`
- ✅ Commit body includes:
  - `REASON:` - Why this change is needed
  - `IMPACT:` - What financial behavior changes
  - `CORRELATION_ID:` - Tracing identifier for the change
- ✅ Idempotency verified
- ✅ Append-only ledger rules followed (no UPDATE/DELETE on ledger_entries)

## Merge Strategies

### Squash and Merge (Default)

Used for all feature branches via auto-merge:
- All commits squashed into one on main
- Clean, linear history
- PR title becomes commit message
- PR body becomes extended commit description

**Example:**
```
PR: "FIZ: RRR-P1-001 — Implement PointLot model"
└── Commits:
    ├── Initial implementation
    ├── Add tests
    ├── Fix linting
    └── Update docs

Merged as single commit on main:
"FIZ: RRR-P1-001 — Implement PointLot model"
```

### Regular Merge

Use for special cases (release branches, preserving commit history):
- Preserves all individual commits
- Shows branch topology
- More complex history

### Rebase and Merge

**NOT RECOMMENDED** for this repository:
- Can complicate conflict resolution
- Loses merge commit context
- Use only when specifically required

## Conflict Resolution

When merge conflicts occur:

1. **Automated detection** - `pr-checks.yml` identifies conflicts
2. **Comment posted** - Includes list of conflicting files and resolution steps
3. **Label added** - `merge-conflict` label applied
4. **Developer action** - Follow guide in `PR_CONFLICT_RESOLUTION.md`
5. **Re-check** - Push resolution → workflows re-run → merge proceeds if green

**For AI agents:** Special protocols in `PR_CONFLICT_RESOLUTION.md` for automated conflict handling and when to HARD_STOP for human review.

## Auto-Merge Behavior

Auto-merge is enabled automatically but only triggers when:

✅ **Safe to merge:**
- All required checks passing (green checkmarks)
- No merge conflicts
- No blocking labels (`work-in-progress`, `blocked`)
- Required approvals obtained (if configured in branch protection)

❌ **Merge blocked:**
- Any check failing
- Merge conflicts exist
- PR marked as draft
- Required approvals pending (FIZ PRs)

## Monitoring and Debugging

### Check Workflow Status

```bash
# View recent workflow runs
gh run list --repo OmniQuestMediaInc/RedRoomRewards

# View specific workflow run
gh run view <run-id> --repo OmniQuestMediaInc/RedRoomRewards

# View logs for failed run
gh run view <run-id> --log --repo OmniQuestMediaInc/RedRoomRewards
```

### Rerun Failed Checks

From PR page:
- Click "Details" next to failed check
- Click "Re-run jobs" → "Re-run failed jobs"

Via CLI:
```bash
gh run rerun <run-id> --failed --repo OmniQuestMediaInc/RedRoomRewards
```

### Common Issues

**Problem:** Checks stuck in "Queued" or "In progress"
- **Cause:** Runner capacity, GitHub outage
- **Fix:** Wait or re-trigger workflow

**Problem:** Auto-merge not engaging
- **Cause:** Conflicts, failed checks, or missing approvals
- **Fix:** Verify all checks green, resolve conflicts, obtain approvals

**Problem:** Merge conflicts not detected
- **Cause:** Workflow not running or failed silently
- **Fix:** Check Actions tab, manually test merge locally

## Adding New Workflows

To add a new workflow:

1. Create file: `.github/workflows/your-workflow.yml`
2. Define trigger events (`on:`)
3. Set required permissions
4. Define jobs and steps
5. Test on feature branch first
6. Document in this README

**Template:**
```yaml
---
name: Your Workflow Name

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  your-job:
    name: Your Job Name
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Your Step
        run: |
          echo "Your commands here"
```

## Linter Configuration

### Markdown (`.github/linters/.markdownlint.yml`)

Rules for Markdown documentation:
- Line length limits
- Header style consistency
- List formatting
- Link validation

### YAML (`.github/linters/.yaml-lint.yml`)

Rules for YAML files:
- Indentation (2 spaces)
- Line length
- Key ordering
- Comment formatting

## Security

### CodeQL Configuration

Located in `.github/workflows/codeql-analysis.yml`:
- Scans GitHub Actions code (`language: actions`)
- Runs on PRs and push to main
- Weekly scheduled scan
- Results in Security tab

### Secrets

No secrets stored in this directory. GitHub secrets used:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- Additional secrets configured at organization/repository level

## Branch Protection

*To be configured via GitHub repository settings:*

**Recommended for `main` branch:**
- ✅ Require pull request reviews before merging (1 reviewer)
- ✅ Require status checks to pass before merging:
  - `pr-checks / check-merge-conflicts`
  - `pr-checks / check-build`
  - `pr-checks / check-tests`
  - `super-linter / Super-Linter`
  - `analyze / Analyze (CodeQL)`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ✅ Allow force pushes: **NO**
- ✅ Allow deletions: **NO**

**Additional for FIZ PRs:**
- Require additional approvals
- Require review from code owners (if CODEOWNERS file exists)

## Related Documentation

- **Program Control System:** `CLAUDE.md`, `.github/copilot-instructions.md` (to be created per bootstrap)
- **Development Standards:** `COPILOT_INSTRUCTIONS.md`
- **Domain Glossary:** `docs/DOMAIN_GLOSSARY.md` (to be created per bootstrap)
- **Requirements:** `docs/REQUIREMENTS_MASTER.md` (to be created per bootstrap)
- **CEO Decisions:** `docs/RRR_CEO_DECISIONS_FINAL_2026-04-17.md` (to be created per bootstrap)

## Support

For issues with workflows or PR automation:

1. Check workflow logs in Actions tab
2. Review relevant documentation in this directory
3. Test changes on feature branch before main
4. Open issue with label `ci-workflow` for CI/CD problems

---

**Authority:** OmniQuest Media Inc. Development Standards
**Maintainer:** RedRoomRewards Engineering Team
**Last Updated:** 2026-04-17
