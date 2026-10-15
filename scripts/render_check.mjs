// Render gate on REAL frames. Usage (run from a folder where `remotion` resolves):
//   node scripts/render_check.mjs --entry examples/sample-12s/index.ts --plan examples/sample-12s/motion-plan.json
// Checks: planned values at checkpoint frames, random-seek determinism (same frame => same pixels,
// regardless of render order), safe-area bounds, text overflow, clock carry on the regression comp.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {webpackOverride} from './webpack-override.mjs';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const entry = path.resolve(arg('entry', 'examples/sample-12s/index.ts'));
const plan = JSON.parse(fs.readFileSync(path.resolve(arg('plan', 'examples/sample-12s/motion-plan.json')), 'utf8'));
const randomCount = Number(arg('random', '6'));
let seed = Number(arg('seed', String(Date.now() % 100000)));
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const SAFE = {side: 80, top: 100, bottom: 1820, stageBottom: 1600, tol: 4};

const errors = [];
const report = {seed, checks: [], seek: [], bounds: 0, framesProbed: 0};
const serveUrl = await bundle({entryPoint: entry, webpackOverride});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emv-'));

async function still(compId, frame, tag) {
  const comp = await selectComposition({serveUrl, id: compId, inputProps: {probe: true}});
  let probe = null;
  const out = path.join(tmp, `${compId}-${frame}-${tag}.png`);
  await renderStill({serveUrl, composition: comp, frame, output: out, inputProps: {probe: true},
    onBrowserLog: (l) => { if (l.text.startsWith('EMV_PROBE ')) probe = JSON.parse(l.text.slice(10)); }});
  const hash = crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex');
  if (!probe) errors.push(`no probe output at ${compId}#${frame}`);
  return {hash, probe};
}

function checkBounds(compId, frame, probe) {
  report.framesProbed++;
  for (const it of probe?.items ?? []) {
    if (!it.visible || it.bleed) continue;
    const [l, t, r, b] = it.rect;
    const where = `${compId}#${frame} ${it.id}`;
    if (it.overflow) errors.push(`text overflow: ${where}`);
    if (l < SAFE.side - SAFE.tol || r > 1080 - SAFE.side + SAFE.tol || t < SAFE.top - SAFE.tol || b > SAFE.bottom)
      errors.push(`out of safe area: ${where} rect=${it.rect}`);
    if (it.kind !== 'caption' && b > SAFE.stageBottom + SAFE.tol) errors.push(`main stage enters caption band: ${where} rect=${it.rect}`);
    report.bounds++;
  }
}
const val = (probe, id) => probe?.items.find((i) => i.id === id)?.value;

// 1. planned checkpoints
const main = 'EMV-Sample';
for (const c of plan.checks) {
  const {probe} = await still(main, c.frame, 'check');
  const got = val(probe, c.id);
  report.checks.push({...c, got, ok: got === c.expect});
  if (got !== c.expect) errors.push(`value check ${c.id}@${c.frame}: expected ${c.expect}, got ${got}`);
  checkBounds(main, c.frame, probe);
}

// 2. random seek determinism: render forward, then reverse; hashes must match
const frames = Array.from({length: randomCount}, () => Math.floor(rnd() * plan.durationInFrames));
const first = {};
for (const f of frames) {
  const r = await still(main, f, 'a');
  first[f] = r.hash;
  checkBounds(main, f, r.probe);
}
for (const f of [...frames].reverse()) {
  const r = await still(main, f, 'b');
  const same = r.hash === first[f];
  report.seek.push({frame: f, same});
  if (!same) errors.push(`seek not deterministic at frame ${f}`);
}

// 3. regression comp: countdown borrow, decimal landing, hh:mm carry
const clockSeq = [];
for (let f = 0; f < 120; f += 4) clockSeq.push(val((await still('EMV-ClockTest', f, 'c')).probe, 'countdown'));
const last = await still('EMV-ClockTest', 119, 'c');
clockSeq.push(val(last.probe, 'countdown'));
if (clockSeq.some((s) => /:6\d/.test(s ?? ''))) errors.push('countdown showed :60+');
if (!(clockSeq.includes('01:00') && clockSeq.includes('00:59'))) errors.push(`countdown did not pass 01:00 -> 00:59: ${clockSeq}`);
const expect3 = [['countdown', '00:58'], ['rate', '12.5%'], ['hhmm', '10:01']];
for (const [id, e] of expect3) {
  const got = val(last.probe, id);
  report.checks.push({frame: 119, id, expect: e, got, ok: got === e});
  if (got !== e) errors.push(`ClockTest ${id}: expected ${e}, got ${got}`);
}
report.countdownSequence = [...new Set(clockSeq)];
report.errors = errors;
const reportPath = arg('report', 'render_check_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`render_check: ${report.checks.filter((c) => c.ok).length}/${report.checks.length} value checks, ${report.seek.filter((s) => s.same).length}/${report.seek.length} seek-identical, ${report.bounds} element boxes in ${report.framesProbed} frames, ${errors.length} errors -> ${reportPath}`);
errors.slice(0, 30).forEach((e) => console.log('ERROR ' + e));
fs.rmSync(tmp, {recursive: true, force: true});
process.exit(errors.length ? 1 : 0);
