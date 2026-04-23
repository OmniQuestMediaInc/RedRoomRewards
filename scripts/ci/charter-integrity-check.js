#!/usr/bin/env node
/**
 * Charter integrity check.
 *
 * Reads .github/PRODUCTION_SCHEDULE.md and asserts that every row whose
 * Status column is "DONE" has a Merge SHA column that is neither "—" nor
 * "pending" (case-insensitive, trimmed).
 *
 * If the schedule file is absent the script exits 0 (nothing to verify).
 * Exits 0 on success, 1 on any mismatch. Designed to run from the repo root.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCHEDULE = path.join(REPO_ROOT, '.github', 'PRODUCTION_SCHEDULE.md');

const PLACEHOLDER_RE = /^(—|-{1,3}|pending)$/i;

function failures() {
  const errors = [];
  const lines = fs.readFileSync(SCHEDULE, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    // Only process pipe-delimited table data rows (skip headers / dividers).
    if (!line.startsWith('|') || /^\|[-: |]+\|$/.test(line)) continue;

    const cols = line.split('|').map((c) => c.trim());
    // Table columns: | ID | Task | Status | Merge SHA |
    // After split on '|' of a row like "|A-003|...|DONE|abc|":
    //   cols[0] = ''  (before first pipe)
    //   cols[1] = ID
    //   cols[2] = Task
    //   cols[3] = Status
    //   cols[4] = Merge SHA
    if (cols.length < 5) continue;

    const id = cols[1];
    const status = cols[3].toUpperCase();
    const mergeSha = cols[4];

    if (status !== 'DONE') continue;

    if (!mergeSha || PLACEHOLDER_RE.test(mergeSha)) {
      errors.push(
        `SCHEDULE INTEGRITY FAIL: Row ${id} is DONE but Merge SHA is "${mergeSha || ''}" (must not be "—" or "pending")`,
      );
    }
  }

  return errors;
}

function main() {
  if (!fs.existsSync(SCHEDULE)) {
    console.log(
      `charter-integrity-check: schedule not present at ${path.relative(REPO_ROOT, SCHEDULE)}; nothing to verify`,
    );
    return;
  }

  const errors = failures();
  if (errors.length > 0) {
    for (const err of errors) console.error(err);
    console.error(`\ncharter-integrity-check: ${errors.length} failure(s)`);
    process.exit(1);
  }
  console.log('charter-integrity-check: OK');
}

main();
