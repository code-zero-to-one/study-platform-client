#!/usr/bin/env node
// Requirement traceability checker for study-platform-client.
// Reads docs/product-ssot/<domain>/traceability.md tables and cross-checks the
// REQ ids against @REQ-* tags found in e2e specs and unit tests.
//
//   node scripts/trace-check.mjs           # report only, always exits 0
//   node scripts/trace-check.mjs --strict  # exit 1 when orphan/broken found
//
// Source of truth for the table format: docs/product-ssot/_shared/traceability-rules.md
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SSOT_DIR = 'docs/product-ssot';
const E2E_DIR = 'e2e';
const SRC_DIR = 'src';
const REQ_ID = /REQ-[A-Z0-9]+-\d{3,}/g;
const strict = process.argv.slice(2).includes('--strict');

// Recursively collect files under `dir` whose name matches `suffix`.
const collectFiles = (dir, suffix, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectFiles(full, suffix, acc);
    else if (entry.endsWith(suffix)) acc.push(full);
  }
  return acc;
};

// Domains = direct subdirectories of docs/product-ssot that hold a
// traceability.md file. Folders starting with "_" (e.g. _shared, _template)
// are scaffolding, not domains.
const readDomainRows = () => {
  const rows = [];
  if (!existsSync(SSOT_DIR)) return rows;
  for (const entry of readdirSync(SSOT_DIR)) {
    if (entry.startsWith('_')) continue;
    const file = join(SSOT_DIR, entry, 'traceability.md');
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf8');
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line.startsWith('|')) continue;
      const cells = line
        .slice(1, line.endsWith('|') ? -1 : undefined)
        .split('|')
        .map((c) => c.trim());
      const reqId = cells[0];
      // Skip header / separator / non-REQ rows.
      if (!/^REQ-[A-Z0-9]+-\d{3,}$/.test(reqId)) continue;
      const verifyCell = cells[4] ?? '';
      const statusCell = (cells[6] ?? '').toLowerCase();
      rows.push({
        domain: entry,
        file,
        reqId,
        tags: verifyCell.match(REQ_ID) ?? [],
        status: statusCell || 'active',
      });
    }
  }
  return rows;
};

// All @REQ-* tags present in test files, with where they were found.
const readTestTags = () => {
  const map = new Map(); // reqId -> Set(file)
  const files = [
    ...collectFiles(E2E_DIR, '.spec.ts'),
    ...collectFiles(SRC_DIR, '.test.ts'),
  ];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const m of content.match(REQ_ID) ?? []) {
      if (!map.has(m)) map.set(m, new Set());
      map.get(m).add(file);
    }
  }
  return map;
};

const rows = readDomainRows();

if (rows.length === 0) {
  process.stdout.write(
    'trace-check: no domains onboarded yet (docs/product-ssot/<domain>/traceability.md). Nothing to verify.\n',
  );
  process.exit(0);
}

const testTags = readTestTags();
const tableReqIds = new Set(rows.map((r) => r.reqId));

// orphan: a @REQ tag exists in tests but no table row declares that id.
const orphans = [];
for (const [reqId, files] of testTags) {
  if (!tableReqIds.has(reqId)) {
    orphans.push({ reqId, files: [...files] });
  }
}

// broken: a table row references a @tag that no test file actually carries.
// gap: an active row has no verification tag at all.
const broken = [];
const gaps = [];
for (const row of rows) {
  if (row.status === 'deprecated') continue;
  if (row.tags.length === 0) {
    if (row.status === 'active') gaps.push(row);
    continue;
  }
  for (const tag of row.tags) {
    if (!testTags.has(tag)) {
      broken.push({ ...row, tag });
    }
  }
}

const report = (label, items, render) => {
  if (items.length === 0) return;
  process.stdout.write(`\n${label} (${items.length}):\n`);
  for (const item of items) process.stdout.write(`  ${render(item)}\n`);
};

process.stdout.write(
  `trace-check: ${rows.length} requirement row(s) across ${new Set(rows.map((r) => r.domain)).size} domain(s).\n`,
);
report(
  '🔴 orphan — tagged in tests but missing from any table',
  orphans,
  (o) => `${o.reqId}  (${o.files.join(', ')})`,
);
report(
  '🟠 broken — table references a tag no test carries',
  broken,
  (b) => `${b.reqId} → ${b.tag}  (${b.file})`,
);
report(
  '🟡 gap — active row with empty verification cell',
  gaps,
  (g) => `${g.reqId}  (${g.file})`,
);

const hardFailures = orphans.length + broken.length;
if (orphans.length + broken.length + gaps.length === 0) {
  process.stdout.write('\n✅ all requirement rows are consistent.\n');
} else if (!strict) {
  process.stdout.write(
    '\n(report-only mode — re-run with --strict to fail on orphan/broken)\n',
  );
}

process.exit(strict && hardFailures > 0 ? 1 : 0);
