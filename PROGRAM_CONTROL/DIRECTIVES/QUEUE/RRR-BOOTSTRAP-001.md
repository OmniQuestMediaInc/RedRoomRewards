DIRECTIVE: RRR-BOOTSTRAP-001
Directive ID: RRR-BOOTSTRAP-001
Date: 2026-04-17
Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Repo: OmniQuestMediaInc/RedRoomRewards
Agent: COPILOT
FIZ: NO
Commit Prefix: CHORE
Branch: chore/program-control-bootstrap
PR Title: CHORE: Install Program Control pipeline — RRR-BOOTSTRAP-001
Parallel-safe: NO — must land on main before any other directive

---

COPILOT EXECUTION INSTRUCTIONS

Read every step in this file before writing any code.
Execute all steps in sequence. Do not skip any file.
Do not touch any file under src/.
FIZ: NO — no financial code is modified in this directive.
Open one PR to main on completion.
File report-back to PROGRAM_CONTROL/REPORT_BACK/RRR-BOOTSTRAP-001-report.md.

---

STEP 1 — FIX MARKDOWNLINT VIOLATIONS

These fixes must be applied before creating any new files.
They clear the chronic CI lint failure on existing files.

1a. File: .github/pull_request_template.md
    Find the first line. It currently reads:
      ## Summary
    Change it to:
      # Summary
    That is the entire change to this file.

1b. File: CONTRIBUTING.md
    Fix 1 — MD040: Fenced code blocks missing language specifier.
    Find every occurrence of a fenced code block that opens with
    three backticks followed immediately by a newline (no language tag).
    Add the appropriate language tag on the opening fence line:
      - Git commands, npm commands, shell/bash commands -> bash
      - TypeScript code -> typescript
    Do not change any content inside the blocks. Only add the language tag.

    Fix 2 — MD034: Bare email addresses.
    Find every bare occurrence of:
      security@omniquestmedia.com
    that is not already inside a markdown link [text](url).
    Wrap each bare occurrence in angle brackets:
      <security@omniquestmedia.com>
    There are two occurrences. Fix both.

    Fix 3 — MD060: Table pipe alignment.
    Find the commit types table (the one listing feat, fix, docs, etc.).
    Ensure all pipe characters in the header row, separator row, and
    data rows are consistently column-aligned. The separator row dashes
    must be at least as wide as the widest cell in each column.

---

STEP 2 — CREATE ESLINT FLAT CONFIG

2a. CREATE file: eslint.config.mjs at repo root

Full file content:

import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.js',
      '*.mjs',
    ],
  },
  {
    files: ['src/**/*.ts', 'api/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'warn',
      'no-console': 'off',
    },
  },
];

2b. PATCH file: package.json
    Change the lint script only. Find this line:
      "lint": "eslint . --ext .ts",
    Replace with:
      "lint": "eslint .",
    No other changes to package.json.

2c. Run: npm run lint
    If exit code 2 (violations found in src/):
      - Prefix unused function params with underscore: _paramName
      - Remove unused local variables if safe to do so
      - Do NOT suppress errors with eslint-disable unless logic cannot change
      - Do NOT change any financial logic, service methods, or balance calculations
    Run npm run lint again. Must exit 0 before committing.

---

STEP 3 — CREATE PROGRAM_CONTROL DIRECTORY STRUCTURE

Create these five empty files (content: blank — for git directory tracking):

  PROGRAM_CONTROL/DIRECTIVES/QUEUE/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/DONE/.gitkeep
  PROGRAM_CONTROL/DIRECTIVES/BACKLOGS/.gitkeep
  PROGRAM_CONTROL/REPORT_BACK/.gitkeep

---

STEP 4 — CREATE CLAUDE.md AT REPO ROOT

File path: CLAUDE.md
Action: CREATE

Full file content:

# CLAUDE.md — RedRoomRewards
Authority: Kevin B. Hartley, CEO — OmniQuest Media Inc.
Repo: OmniQuestMediaInc/RedRoomRewards
Date: 2026-04-17

## Role

Claude Code is a senior execution agent for RedRoomRewards.
It receives directives from PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/,
executes exactly what is specified, and files a report-back to
PROGRAM_CONTROL/REPORT_BACK/.

## Stack

- Runtime: Node.js + TypeScript (strict)
- Database: MongoDB + Mongoose (no Prisma)
- Package manager: npm (not Yarn — never use yarn commands)
- Test runner: Jest
- Build: npm run build
- Type check: npx tsc --noEmit
- Lint: npm run lint

## Commit Prefix Enum (RRR — authoritative)

FIZ   — Financial Integrity​​​​​​​​​​​​​​​​
