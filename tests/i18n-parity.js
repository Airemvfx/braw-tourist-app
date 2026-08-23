#!/usr/bin/env node
// ============================================================
// Every UI string exists in both languages, with the same
// placeholders, and every key the app asks for exists at all.
//
// This runs without a browser: it parses js/i18n.js for the two
// dictionaries and greps the rest of the source for t('...') calls.
// A missing Polish string is invisible in testing — the engine falls
// back to English and the screen still looks fine — so nothing but a
// check like this catches it.
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');

/** Pull one `const NAME = { ... };` dictionary's keys and values. */
function dictionary(name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`no dictionary called ${name}`);
  let i = src.indexOf('{', start);
  let depth = 0;
  let end = i;
  for (; end < src.length; end++) {
    if (src[end] === '{') depth++;
    else if (src[end] === '}') { depth--; if (!depth) break; }
  }
  const body = src.slice(i + 1, end);
  const out = new Map();
  for (const m of body.matchAll(/^\s*'((?:[^'\\]|\\.)+)'\s*:\s*(['"`])((?:[^\\]|\\.)*?)\2\s*,\s*$/gm)) {
    out.set(m[1], m[3]);
  }
  return out;
}

const en = dictionary('EN');
const pl = dictionary('PL');

let failures = 0;
const fail = msg => { console.log(`  ✗ ${msg}`); failures++; };

console.log(`English keys: ${en.size}`);
console.log(`Polish keys:  ${pl.size}`);

// ---- 1. parity ----
const missingPl = [...en.keys()].filter(k => !pl.has(k));
const extraPl = [...pl.keys()].filter(k => !en.has(k));
if (missingPl.length) missingPl.forEach(k => fail(`Polish is missing "${k}"`));
if (extraPl.length) extraPl.forEach(k => fail(`Polish has "${k}" with no English original`));
if (!missingPl.length && !extraPl.length) console.log('  ✓ both languages carry the same keys');

// ---- 2. placeholders ----
const holders = s => new Set([...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]));
let mismatched = 0;
for (const [k, v] of en) {
  if (!pl.has(k)) continue;
  const a = holders(v);
  const b = holders(pl.get(k));
  const missing = [...a].filter(x => !b.has(x));
  const surplus = [...b].filter(x => !a.has(x));
  if (missing.length || surplus.length) {
    fail(`"${k}" placeholders differ — English has {${[...a]}}, Polish has {${[...b]}}`);
    mismatched++;
  }
}
if (!mismatched) console.log('  ✓ placeholders match across both languages');

// ---- 3. every key the app asks for exists ----
// Only literal t('...') calls; computed keys are listed as prefixes and
// checked by asking that at least one key with that prefix exists.
const files = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'));
const asked = new Set();
for (const f of files) {
  const text = fs.readFileSync(path.join(root, 'js', f), 'utf8');
  for (const m of text.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) asked.add(m[1]);
}
const unknown = [...asked].filter(k => !en.has(k));
unknown.forEach(k => fail(`the app calls t('${k}') but no such string exists`));
if (!unknown.length) console.log(`  ✓ all ${asked.size} literal t() keys exist`);

// Template keys such as t(`vault.durability.${x}`) — check each family
// has the full set of members the code can produce.
const families = {
  'vault.durability.': ['persisted', 'besteffort', 'denied', 'none'],
  'vault.risk.': ['empty', 'safe', 'ok', 'medium', 'high'],
  'shop.grade.': ['good', 'fair', 'poor'],
  'store.status.': ['draft', 'submitted', 'paid', 'fulfilled', 'cancelled'],
  'cloud.err.': ['offline', 'network', 'timeout', 'rateLimit', 'badLogin', 'taken',
                 'unconfirmed', 'passShort', 'badEmail', 'denied', 'server', 'failed',
                 'signedOut', 'offConfig'],
  'data.err.': ['notJson', 'notBackup', 'tooNew', 'failed'],
};
let famBad = 0;
for (const [prefix, members] of Object.entries(families)) {
  for (const m of members) {
    if (!en.has(prefix + m)) { fail(`missing English "${prefix + m}"`); famBad++; }
    if (!pl.has(prefix + m)) { fail(`missing Polish "${prefix + m}"`); famBad++; }
  }
}
if (!famBad) console.log('  ✓ every templated key family is complete in both languages');

// ---- 4. nothing left in English inside the Polish block ----
// A copied-but-untranslated line is easy to miss. Identical strings are
// legitimate for names, units and symbols, so only flag ones that look
// like real prose: several words, and letters Polish would normally
// have marked or worded differently.
const suspicious = [...en.keys()].filter(k => {
  const a = en.get(k), b = pl.get(k);
  if (!b || a !== b) return false;
  if (a.split(/\s+/).length < 4) return false;
  return /[a-z]{4}/i.test(a);
});
if (suspicious.length) {
  suspicious.forEach(k => console.log(`  ! "${k}" is word-for-word identical in both languages — check it was translated`));
}

console.log('');
if (failures) { console.log(`${failures} problem(s)`); process.exit(1); }
console.log('i18n parity holds');
