#!/usr/bin/env node
/**
 * Charter integrity check (RRR-WORK-001-A003).
 *
 * Parses PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-WORK-001.md, collects every task
 * with `Status: DONE`, and asserts:
 *   1. A DONE record exists at PROGRAM_CONTROL/DIRECTIVES/DONE/RRR-WORK-001-<id>-DONE.md
 *   2. That record carries a real 40-char merge SHA (field name "Merge commit"
 *      or "Merge SHA"), not a placeholder
 *   3. The SHA is reachable in this checkout (`git cat-file -e <sha>`)
 *
 * Exits 0 on success, 1 on any mismatch. Designed to run from the repo root.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CHARTER = path.join(
  REPO_ROOT,
  'PROGRAM_CONTROL',
  'DIRECTIVES',
  'QUEUE',
  'RRR-WORK-001.md',
);
const DONE_DIR = path.join(REPO_ROOT, 'PROGRAM_CONTROL', 'DIRECTIVES', 'DONE');
const CHARTER_PREFIX = 'RRR-WORK-001';

const SHA_RE = /\b[0-9a-f]{40}\b/;
const TASK_HEADING_RE = /^#{2,4}\s+Task\s+(A-[A-Z0-9]+)\b/i;
const STATUS_RE = /^\s*[-*]\s+\*\*Status:\*\*\s+(\S+)/i;

function failures() {
  const errors = [];
  const charter = fs.readFileSync(CHARTER, 'utf8').split(/\r?\n/);

  // Walk the charter top-to-bottom; the first Status line after each task
  // heading belongs to that task.
  let currentTask = null;
  const doneTasks = [];
  for (const line of charter) {
    const headingMatch = line.match(TASK_HEADING_RE);
    if (headingMatch) {
      currentTask = headingMatch[1];
      continue;
    }
    if (!currentTask) continue;
    const statusMatch = line.match(STATUS_RE);
    if (statusMatch) {
      const status = statusMatch[1].toUpperCase();
      if (status === 'DONE') doneTasks.push(currentTask);
      currentTask = null;
    }
  }

  if (doneTasks.length === 0) {
    console.log('charter-integrity-check: no DONE tasks found in charter; nothing to verify');
    return errors;
  }

  for (const taskId of doneTasks) {
    // Charter headings use `Task A-001`; DONE-record files use `A001`.
    const fileTaskId = taskId.replace(/^A-/, 'A');
    const recordPath = path.join(DONE_DIR, `${CHARTER_PREFIX}-${fileTaskId}-DONE.md`);
    const relRecord = path.relative(REPO_ROOT, recordPath);

    if (!fs.existsSync(recordPath)) {
      errors.push(
        `CHARTER INTEGRITY FAIL: Task ${taskId} marked DONE but missing DONE record at ${relRecord}`,
      );
      continue;
    }

    const recordText = fs.readFileSync(recordPath, 'utf8');
    const shaLine = recordText
      .split(/\r?\n/)
      .find((l) => /^\s*\*\*Merge\s+(commit|SHA):\*\*/i.test(l));

    if (!shaLine) {
      errors.push(
        `CHARTER INTEGRITY FAIL: Task ${taskId} DONE record at ${relRecord} has no "Merge commit" / "Merge SHA" line`,
      );
      continue;
    }

    const shaMatch = shaLine.match(SHA_RE);
    if (!shaMatch) {
      errors.push(
        `CHARTER INTEGRITY FAIL: Task ${taskId} DONE record at ${relRecord} merge SHA is missing or a placeholder (line: ${shaLine.trim()})`,
      );
      continue;
    }

    const sha = shaMatch[0];
    try {
      execFileSync('git', ['cat-file', '-e', sha], { stdio: 'ignore' });
    } catch {
      errors.push(
        `CHARTER INTEGRITY FAIL: Task ${taskId} merge SHA ${sha} is not reachable in this checkout (git cat-file -e failed)`,
      );
    }
  }

  return errors;
}

function main() {
  if (!fs.existsSync(CHARTER)) {
    console.error(`charter-integrity-check: charter not found at ${CHARTER}`);
    process.exit(1);
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
