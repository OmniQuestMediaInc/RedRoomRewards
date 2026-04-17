# Pull Request Conflict Resolution Guide
# RedRoomRewards — OmniQuest Media Inc.

## Overview

This document provides guidance for handling pull request conflicts in the RedRoomRewards repository. Both human developers and AI agents (Copilot, Claude Code) should follow these procedures.

## Conflict Detection

### Automated Detection

The repository uses several mechanisms to detect conflicts:

1. **GitHub Merge Conflict Detection** - GitHub automatically detects merge conflicts when a PR cannot be auto-merged
2. **Directive File Conflict Detection** - The `directive-dispatch.yml` workflow scans for overlapping file paths in directive **Touches:** fields
3. **CI Status Checks** - Linting and CodeQL must pass before merge

### Manual Detection

Before starting work on a PR:
1. Sync with latest main: `git fetch origin && git pull origin main`
2. Check for open PRs affecting the same files
3. Review PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/ for overlapping work

## Conflict Resolution Process

### Step 1: Identify the Conflict

When GitHub shows "This branch has conflicts that must be resolved":

```bash
# Fetch latest changes
git fetch origin

# Check conflict status
git status

# View conflicting files
git diff --name-only --diff-filter=U
```

### Step 2: Update Your Branch

```bash
# Ensure you're on your feature branch
git checkout your-branch-name

# Fetch and merge latest main
git fetch origin main:refs/remotes/origin/main --unshallow || git fetch origin main:refs/remotes/origin/main
git merge origin/main
```

**IMPORTANT**: Never use `--depth=1` or shallow fetches before merging. Always unshallow first if needed.

### Step 3: Resolve Conflicts

For each conflicting file:

1. **Open the file** - Conflict markers look like:
   ```
   <<<<<<< HEAD
   your changes
   =======
   incoming changes from main
   >>>>>>> origin/main
   ```

2. **Resolve the conflict** - Edit the file to combine changes appropriately:
   - Keep both changes if they don't overlap logically
   - Choose one if they're mutually exclusive
   - Manually merge if they affect the same logic
   - Remove conflict markers

3. **Stage the resolved file**:
   ```bash
   git add path/to/resolved/file.ts
   ```

### Step 4: Complete the Merge

```bash
# After resolving all conflicts, verify status
git status

# Ensure all conflicts are resolved (no "both modified" or "unmerged" files)
git add .

# Complete the merge commit
git commit -m "Merge origin/main into feature-branch - resolved conflicts"

# Push to your PR branch
git push origin your-branch-name
```

**CRITICAL**: The merge commit MUST have two parents (HEAD and MERGE_HEAD). Do NOT checkout another branch or reset before committing - this would clear merge state.

### Step 5: Verify Resolution

After pushing:

```bash
# Run build locally
npm run build

# Run tests locally
npm test

# Run linter
npm run lint
```

The PR will re-trigger CI checks. Ensure all pass before requesting review.

## Conflict Types and Strategies

### Code Conflicts

**Same file, different lines**: Usually auto-resolved by Git.

**Same file, same lines**:
- Review both changes carefully
- Understand the intent of each change
- Combine or choose based on correctness
- Add tests if behavior changes

**Import/dependency conflicts**:
- Keep all unique imports
- Remove duplicates
- Maintain alphabetical order

### Configuration Conflicts

**package.json/package-lock.json**:
```bash
# After resolving package.json
npm install
git add package-lock.json
```

**tsconfig.json or similar**:
- Review both changes
- Keep stricter settings when in doubt
- Document reasoning in commit message

### Documentation Conflicts

- Keep both additions when content is different
- Merge updates to the same section logically
- Maintain consistent formatting

## Financial Integrity Zone (FIZ) Conflicts

**CRITICAL**: FIZ-scoped files require extra care:

- `src/ledger/ledger.service.ts`
- `src/wallets/wallet.service.ts`
- Any file touching point balances or ledger entries

### FIZ Conflict Rules

1. **Never** merge conflicting logic that could affect financial calculations
2. **Always** test financial operations after conflict resolution
3. **Document** the resolution in commit message with REASON and IMPACT
4. **Request human review** for all FIZ conflicts before merge

Example FIZ conflict resolution commit:
```
FIZ: Resolve merge conflict in wallet.service.ts

REASON: Merged concurrent changes to credit operation - one added
idempotency check, another added correlation_id logging
IMPACT: Combined both improvements - no functional change to credit logic
CORRELATION_ID: MERGE-CONFLICT-2026-04-17-001
```

## Automated Conflict Prevention

### Directive-Level Conflict Detection

The repository's `directive-dispatch.yml` workflow automatically:
1. Scans all directives in QUEUE and IN_PROGRESS
2. Extracts **Touches:** file paths
3. Opens conflict issues for overlapping paths
4. Labels with `conflict` and `needs-conflict-review`

When a conflict issue is opened:
- **Do NOT** proceed with either directive
- Human must determine sequencing
- One directive may need to be re-queued or modified

### Parallel-Safe Directives

Directives marked `**Parallel-safe:** YES` can execute concurrently because they touch different files or are read-only.

Directives marked `**Parallel-safe:** NO` must be sequenced.

## When to Ask for Help

Request human review when:

1. **Financial logic conflicts** - Any FIZ-scoped conflict
2. **Architectural conflicts** - Changes affecting core system design
3. **Cannot resolve safely** - Unclear which version is correct
4. **Test failures after resolution** - New failures appear post-merge
5. **Directive conflicts** - Multiple agents targeting same files

## AI Agent Specific Guidance

### For Copilot

When you encounter a merge conflict:
1. Pull latest main
2. Attempt automatic resolution for simple conflicts (imports, docs)
3. For code logic conflicts: HARD_STOP and flag for human review
4. For FIZ conflicts: ALWAYS flag for human review
5. Document all resolution steps in report-back

### For Claude Code

When you encounter a merge conflict:
1. Follow Step 1-4 above exactly
2. Use git commands to identify conflicting files
3. Read both versions of conflicting code
4. Make minimal changes to resolve
5. Verify builds and tests pass
6. Document resolution in commit message
7. For FIZ conflicts: create issue and HARD_STOP

## Merge Strategies

### Squash and Merge (Default)

Used for feature branches via auto-merge workflow:
- All commits in PR squashed into one
- Clean main branch history
- Preserves PR discussion and review

### Regular Merge

Used for release branches or special cases:
- Preserves all individual commits
- Shows branch topology
- Use when commit history is valuable

### Rebase and Merge

NOT RECOMMENDED for this repository:
- Can complicate conflict resolution
- Loses merge commit context
- Avoid unless specifically required

## Prevention Best Practices

1. **Small PRs** - Easier to review and less likely to conflict
2. **Frequent syncs** - Merge main into your branch daily
3. **Clear ownership** - Use directive system to claim files
4. **Communication** - Comment on related PRs when starting similar work
5. **Quick reviews** - Faster merges reduce conflict window

## References

- GitHub Docs: [Resolving merge conflicts](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts)
- Repository: `.github/workflows/directive-dispatch.yml` (automated conflict detection)
- Repository: `.github/copilot-instructions.md` (agent conflict protocol)
- Repository: `CLAUDE.md` (Claude Code conflict protocol)

---

**Authority:** OmniQuest Media Inc. Development Standards
**Maintainer:** RedRoomRewards Engineering Team
**Last Updated:** 2026-04-17
