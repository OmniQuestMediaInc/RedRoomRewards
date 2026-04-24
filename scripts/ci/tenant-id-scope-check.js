#!/usr/bin/env node
/**
 * tenant_id scope CI guard (Task B-009).
 *
 * Walks src/services/, src/wallets/, src/ledger/ for mongoose Model
 * query calls (.find, .findOne, .findById, .findOneAndUpdate,
 * .updateOne, .updateMany, .deleteOne, .deleteMany, .countDocuments)
 * and reports any call whose first argument (the filter object) does
 * NOT mention `tenant_id`.
 *
 * Behavior:
 *   - Loads scripts/ci/tenant-id-allowlist.json — a list of
 *     `{ file, line }` baseline violations that pre-date the tenancy
 *     model layer (B-004). These are reported as INFO, not failures.
 *   - Any new violation outside the allowlist FAILS the build.
 *   - The "baseline" is captured as part of the B-009 commit so that
 *     future regressions are visible against a stable reference.
 *
 * Usage:
 *   node scripts/ci/tenant-id-scope-check.js
 *   node scripts/ci/tenant-id-scope-check.js --report
 *   node scripts/ci/tenant-id-scope-check.js --update-baseline
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TARGET_DIRS = ['src/services', 'src/wallets', 'src/ledger'].map((d) =>
  path.join(REPO_ROOT, d),
);
const ALLOWLIST_PATH = path.join(__dirname, 'tenant-id-allowlist.json');

// Mongoose model query method names — the ones B-009 cares about.
const QUERY_METHODS = [
  'find',
  'findOne',
  'findById',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndReplace',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'countDocuments',
  'distinct',
];

// Match `<UpperCamel>Model.<method>(` — the conventional shape.
// Capture the model name + method name; the offsets help slice the
// argument span out of the surrounding source.
const CALL_RE = new RegExp(
  `\\b([A-Z][A-Za-z0-9_]*Model)\\.(${QUERY_METHODS.join('|')})\\s*\\(`,
  'g',
);

function isExcludedFile(rel) {
  return (
    rel.endsWith('.spec.ts') ||
    rel.endsWith('.test.ts') ||
    rel.includes(`${path.sep}__tests__${path.sep}`) ||
    rel.includes('/__tests__/')
  );
}

function* walkTs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkTs(full);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      yield full;
    }
  }
}

/**
 * Find the matching `)` for an opening `(` at index `open` in `source`.
 * Tracks parens, brackets, braces, single/double/template quotes, and
 * line / block comments. Returns the index of the closing paren, or -1
 * if not found.
 */
function matchClosingParen(source, open) {
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let inLine = false;
  let inBlock = false;

  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];
    if (inLine) {
      if (ch === '\n') inLine = false;
      continue;
    }
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inBacktick) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === '`') inBacktick = false;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLine = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlock = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '`') {
      inBacktick = true;
      continue;
    }
    if (ch === '(') depthParen++;
    else if (ch === ')') {
      depthParen--;
      if (depthParen === 0) return i;
    } else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket--;
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace--;
  }
  return -1;
}

function lineFor(source, idx) {
  // 1-indexed line for offset idx.
  let line = 1;
  for (let i = 0; i < idx; i++) {
    if (source[i] === '\n') line++;
  }
  return line;
}

function findViolations() {
  const violations = [];
  for (const dir of TARGET_DIRS) {
    for (const file of walkTs(dir)) {
      const rel = path.relative(REPO_ROOT, file);
      if (isExcludedFile(rel)) continue;
      const source = fs.readFileSync(file, 'utf8');

      let m;
      CALL_RE.lastIndex = 0;
      while ((m = CALL_RE.exec(source))) {
        const callOpen = m.index + m[0].length - 1;
        const callClose = matchClosingParen(source, callOpen);
        if (callClose < 0) continue;
        const argSpan = source.slice(callOpen + 1, callClose);
        if (/\btenant_id\b/.test(argSpan)) continue;

        violations.push({
          file: rel,
          line: lineFor(source, m.index),
          model: m[1],
          method: m[2],
        });
      }
    }
  }
  return violations;
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return [];
  const data = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  return Array.isArray(data.allow) ? data.allow : [];
}

function keyOf(v) {
  return `${v.file}:${v.line}:${v.model}.${v.method}`;
}

function main() {
  const v = findViolations();
  const allowlist = loadAllowlist();
  const allowSet = new Set(allowlist.map(keyOf));

  if (process.argv.includes('--update-baseline')) {
    const allow = v
      .map((x) => ({ file: x.file, line: x.line, model: x.model, method: x.method }))
      .sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
    const out = {
      $schema: 'https://json.schemastore.org/base.json',
      _comment:
        'B-009 baseline allowlist. Each entry is a Model query call site that pre-dates the tenancy layer (B-004) and lacks a tenant_id filter. Adding to this list requires a documented justification or a follow-up ticket. The B-009 CI guard fails on any new violation that is not on this list.',
      allow,
    };
    fs.writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(out, null, 2)}\n`);
    console.log(`Wrote ${ALLOWLIST_PATH} with ${allow.length} baseline entries.`);
    return process.exit(0);
  }

  const newViolations = v.filter((x) => !allowSet.has(keyOf(x)));

  if (process.argv.includes('--report')) {
    console.log(`tenant_id-scope-check: total findings = ${v.length}`);
    console.log(`tenant_id-scope-check: allowlisted = ${v.length - newViolations.length}`);
    console.log(`tenant_id-scope-check: new violations = ${newViolations.length}`);
    for (const x of newViolations) {
      console.log(`  ${x.file}:${x.line}  ${x.model}.${x.method}`);
    }
    return process.exit(newViolations.length === 0 ? 0 : 1);
  }

  if (newViolations.length === 0) {
    console.log(
      `tenant_id-scope-check: OK (${v.length} known findings; 0 new violations vs allowlist)`,
    );
    return process.exit(0);
  }

  console.error(
    `tenant_id-scope-check: ${newViolations.length} NEW violation(s) outside the allowlist:`,
  );
  for (const x of newViolations) {
    console.error(`  ${x.file}:${x.line}  ${x.model}.${x.method}`);
  }
  console.error(
    '\nFix: add a `tenant_id: { $eq: ... }` clause to the filter, or — only if there is a documented exception — append the call site to scripts/ci/tenant-id-allowlist.json with a justification ticket.',
  );
  process.exit(1);
}

main();
