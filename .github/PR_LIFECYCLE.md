# Pull Request Lifecycle Management
# RedRoomRewards — OmniQuest Media Inc.

## Overview

This document describes the complete lifecycle of pull requests in the RedRoomRewards repository, from creation through merge or closure.

## PR Lifecycle States

```
┌─────────────┐
│   Created   │  Initial PR opened
└─────┬───────┘
      │
      ├── Automated checks triggered
      │   - Merge conflict detection
      │   - Build verification
      │   - Test execution
      │   - Linting
      │   - CodeQL security scan
      │
      ├── Auto-merge enabled (if configured)
      │
      v
┌─────────────┐
│  In Review  │  Awaiting checks and/or approval
└─────┬───────┘
      │
      ├── [IF CONFLICTS] → Needs Resolution
      │   - Labeled "merge-conflict"
      │   - Auto-merge disabled
      │   - Developer resolves conflicts
      │   - Push updates → Re-triggers checks
      │
      ├── [IF BUILD FAILS] → Needs Fixes
      │   - CI comments on PR
      │   - Developer fixes issues
      │   - Push updates → Re-triggers checks
      │
      └── [IF ALL PASS] → Ready for Merge
          │
          ├── Auto-merge enabled
          │   - Waits for required checks
          │   - Squash merges automatically when green
          │
          └── Manual merge (if needed)
              - Reviewer clicks merge button
              - Squash/Merge/Rebase options available
              │
              v
        ┌─────────────┐
        │   Merged    │  Code on main branch
        └─────┬───────┘
              │
              ├── Directive moved QUEUE → IN_PROGRESS (on open)
              ├── Directive moved IN_PROGRESS → DONE (on merge)
              ├── Related issue closed automatically
              └── Branch can be deleted
```

## Stage 1: PR Creation

### How PRs Are Created

**By AI Agents (Copilot/Claude Code):**
```bash
# Agent completes work on feature branch
gh pr create \
  --title "[PREFIX]: [ID] — [description]" \
  --body "$(cat PROGRAM_CONTROL/REPORT_BACK/[ID]-REPORT-BACK.md)" \
  --label "copilot-task" \
  --label "ready-for-review"
```

**By Developers:**
```bash
# Via GitHub CLI
gh pr create --fill

# Via GitHub UI
# Navigate to repository → Pull Requests → New Pull Request
```

### PR Naming Convention

Format: `[PREFIX]: [ID] — [Short Description]`

Examples:
- `CHORE: RRR-P1-001 — Implement PointLot model`
- `FIZ: RRR-P0-001 — Wire wallet controller to real services`
- `API: Add checkout quote endpoint`
- `TEST: Add integration tests for ledger service`

### Labels Applied

**Automatically:**
- `copilot-task` - Created by Copilot
- `claude-code-task` - Created by Claude Code
- `merge-conflict` - Added when conflicts detected
- `fiz-review-required` - FIZ-scoped changes

**Manually:**
- `ready-for-review` - Work complete, ready for review
- `work-in-progress` - Not ready for review yet
- `blocked` - Cannot proceed (dependencies, decisions needed)

## Stage 2: Automated Checks

### Workflow Triggers

On PR open, synchronize (new push), or reopen:

1. **`pr-checks.yml`** - Merge conflict detection, build, tests
2. **`lint.yml`** - Super-Linter validation (YAML, JSON, Markdown)
3. **`codeql-analysis.yml`** - Security scanning
4. **`auto-merge.yml`** - Enables auto-merge if applicable

### Check Descriptions

**Merge Conflict Check:**
- Fetches latest main
- Attempts test merge
- Reports conflicting files
- Adds `merge-conflict` label if conflicts found
- Posts resolution guidance comment

**Build Check:**
- Runs `tsc --noEmit` (TypeScript compilation)
- Runs `npm run build`
- Comments on PR if build fails

**Test Check:**
- Runs `npm test -- --ci --coverage --maxWorkers=2`
- Comments on PR if tests fail

**Lint Check:**
- Validates YAML, JSON, Markdown syntax
- Applies linter rules from `.github/linters/`

**Security Check:**
- Runs CodeQL analysis
- Scans for security vulnerabilities
- Reports findings in Security tab

### Status Updates

All checks post back to GitHub:
- ✅ Green checkmark: Passed
- ❌ Red X: Failed
- ⏸️ Yellow dot: In progress
- ⚪ Gray circle: Not run or skipped

## Stage 3: Conflict Resolution

### When Conflicts Occur

Conflicts happen when:
- Main branch has changed files also modified in PR
- Two PRs modify the same lines simultaneously
- File deleted in main but modified in PR (or vice versa)

### Detection

**Automated:**
- `pr-checks.yml` workflow runs merge test
- GitHub's native conflict detection
- Comment posted to PR with conflicting files

**Directive-level:**
- `directive-dispatch.yml` scans **Touches:** fields
- Opens conflict issues for overlapping file paths
- Prevents parallel execution of conflicting directives

### Resolution Process

**For Developers:**
1. Checkout PR branch locally
2. Fetch and merge main: `git fetch origin main && git merge origin/main`
3. Resolve conflicts in editor
4. Stage resolved files: `git add .`
5. Commit merge: `git commit`
6. Push: `git push`

**For AI Agents:**
1. Detect conflict via workflow notification
2. Follow resolution steps in `.github/PR_CONFLICT_RESOLUTION.md`
3. For FIZ conflicts: HARD_STOP and request human review
4. Document resolution in commit message
5. Re-run checks after resolution

**See:** `.github/PR_CONFLICT_RESOLUTION.md` for detailed guidance.

## Stage 4: Review and Approval

### Review Requirements

**Standard PRs:**
- All automated checks pass
- Code review (optional but recommended)
- No merge conflicts

**FIZ-scoped PRs:**
- All automated checks pass
- **REQUIRED:** Human review and approval
- Labeled `fiz-review-required`
- Extra scrutiny for financial logic

### Review Process

**Reviewers check:**
- Code correctness and clarity
- Test coverage
- Documentation updates
- Security implications
- Adherence to coding standards
- Commit message quality

**Review actions:**
- **Approve** - LGTM, ready to merge
- **Request changes** - Issues that must be fixed
- **Comment** - Non-blocking feedback

## Stage 5: Auto-Merge

### How Auto-Merge Works

The `auto-merge.yml` workflow:
1. Triggers on PR open/synchronize/reopen
2. Enables auto-merge with squash strategy
3. GitHub automatically merges when:
   - All required checks pass
   - No merge conflicts
   - (Optional) Required approvals obtained

### Squash and Merge

Default merge strategy:
- All PR commits squashed into single commit on main
- Commit message: PR title
- Commit body: PR description + co-author attribution
- Clean, linear main branch history

### When Auto-Merge Doesn't Apply

- PR has conflicts
- Required checks failing
- Labeled `work-in-progress` or `blocked`
- Branch protection requires approval (approval not yet given)
- Author/admin disabled auto-merge

In these cases: manual merge by reviewer.

## Stage 6: Post-Merge Actions

### Automated After Merge

**Directive lifecycle (via `directive-dispatch.yml`):**
- Directive file moved: `IN_PROGRESS/[ID].md` → `DONE/[ID].md`
- Related issue closed automatically
- Comment added to issue: "Directive complete. PR #X merged."

**Branch cleanup:**
- Feature branch can be deleted (automatic or manual)

**Notifications:**
- Watchers notified of merge
- Linked issues updated

### Manual After Merge

**If needed:**
- Update project boards
- Notify stakeholders
- Deploy to staging/production (if applicable)
- Update documentation sites

## Stage 7: PR Closure (Without Merge)

### When PRs Are Closed Without Merging

- Work abandoned or superseded
- Approach changed after discussion
- Duplicate of another PR
- Conflicts too complex to resolve

### Process

1. Comment explaining closure reason
2. Close PR (GitHub UI or `gh pr close`)
3. If directive-based: move directive back to QUEUE or mark as DEFERRED
4. Update REQUIREMENTS_MASTER.md status
5. Delete feature branch

## Special Cases

### Draft PRs

- Marked as draft: not ready for review
- Can still trigger some CI checks
- Cannot be merged until marked "Ready for review"
- Use for: work-in-progress, early feedback requests

### Hotfix PRs

- Critical production issues
- May bypass normal review process
- Still requires all checks to pass
- Label: `hotfix`, `priority-high`
- Fast-track review and merge

### Dependabot PRs

- Automated dependency updates
- Auto-approved if all checks pass
- May auto-merge via dependabot config
- Review if major version bumps

### Backport PRs

- Applies fix from main to release branch
- Usually cherry-picks from merged PR
- May have conflicts due to version differences
- Target branch: release branch, not main

## Monitoring PR Health

### Metrics to Track

- Time from open to merge
- Number of conflicts per week
- Build/test failure rate
- Review turnaround time

### Health Indicators

**Good:**
- PRs merge within 1-2 days
- < 10% conflict rate
- > 90% check pass rate
- Reviews completed within 24 hours

**Needs attention:**
- PRs open for weeks
- High conflict rate (> 20%)
- Frequent build/test failures
- Review bottlenecks

## Troubleshooting

### PR Stuck in "Checking" State

**Cause:** Workflow not completing
**Fix:**
- Check Actions tab for workflow status
- Rerun failed workflows
- Check for workflow syntax errors

### Auto-Merge Not Triggering

**Cause:** Checks not passing or conflicts exist
**Fix:**
- Verify all checks are green
- Resolve any merge conflicts
- Check branch protection requirements

### Cannot Push to PR Branch

**Cause:** Permissions or branch protection
**Fix:**
- Verify you have write access
- Check if branch is protected
- Try via fork if contributing externally

### CI Checks Failing Unexpectedly

**Cause:** Flaky tests, network issues, environment problems
**Fix:**
- Rerun checks (GitHub UI "Re-run failed jobs")
- Check workflow logs for details
- Update dependencies if needed

## Best Practices

### For PR Authors

1. **Keep PRs small** - Easier to review and merge
2. **Write clear descriptions** - Use PR template
3. **Link related issues** - Context for reviewers
4. **Keep branch updated** - Merge main regularly
5. **Respond to feedback quickly** - Faster merge
6. **Self-review before submitting** - Catch obvious issues

### For Reviewers

1. **Review promptly** - Don't block others
2. **Be constructive** - Suggest improvements
3. **Test locally when needed** - Verify functionality
4. **Focus on important issues** - Don't nitpick style if linters handle it
5. **Approve or request changes clearly** - No ambiguity

### For AI Agents

1. **Follow directive exactly** - DROID MODE
2. **Document all work** - Report-back required
3. **HARD_STOP on FIZ conflicts** - Never guess
4. **Run checks locally first** - Before pushing
5. **Small, atomic commits** - Easier to review and revert

## References

- GitHub Docs: [About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- Repository: `.github/workflows/pr-checks.yml` (automated PR checks)
- Repository: `.github/workflows/auto-merge.yml` (auto-merge configuration)
- Repository: `.github/workflows/directive-dispatch.yml` (directive lifecycle)
- Repository: `.github/PR_CONFLICT_RESOLUTION.md` (conflict resolution guide)
- Repository: `.github/pull_request_template.md` (PR template)

---

**Authority:** OmniQuest Media Inc. Development Standards
**Maintainer:** RedRoomRewards Engineering Team
**Last Updated:** 2026-04-17
