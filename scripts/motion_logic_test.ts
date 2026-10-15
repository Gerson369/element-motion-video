// Pure-logic gate: run with `npx tsx scripts/motion_logic_test.ts` (exit 1 on failure).
import {countValue, formatNumber, odometerPositions, settledDigit} from '../components/core/number';
import {clockRoll, clockSeconds, formatClock} from '../components/core/clock';
import {progress} from '../components/core/timing';
import {pose} from '../components/Move';

let fail = 0;
let pass = 0;
const ok = (cond: boolean, msg: string) => {
  if (cond) pass++;
  else {
    fail++;
    console.log('FAIL ' + msg);
  }
};

// 1. counters land exactly, never overshoot while moving, every easing
for (const ease of ['linear', 'out', 'inOut', 'outBack', 'outExpo'] as const) {
  for (const [from, to, d] of [[0, 128, 0], [0, 12.5, 1], [100, 0, 0], [0, 24813, 0], [3.14, 99.99, 2]]) {
    const dur = 45;
    let prev = from;
    for (let f = 0; f <= dur + 10; f++) {
      const v = countValue(progress(f, 0, dur, ease), from, to, d);
      ok(to >= from ? v <= to && v >= prev - 1e-9 || ease === 'outBack' : v >= to, `no overshoot ${ease} ${from}->${to} f${f} v=${v}`);
      prev = v;
    }
    ok(countValue(progress(dur, 0, dur, ease), from, to, d) === to, `exact landing ${ease} ${from}->${to}`);
    ok(countValue(progress(dur + 99, 0, dur, ease), from, to, d) === to, `stays landed ${ease}`);
  }
}
ok(formatNumber(12.5, {decimals: 1, suffix: '%'}) === '12.5%', 'decimal format');
ok(formatNumber(24813, {grouping: true}) === '24,813', 'grouping');
ok(formatNumber(123456, {cnUnit: true}) === '12.3万', 'cn unit 万');

// 2. odometer: final digits exact; higher column only turns on carry
const pos = odometerPositions(128, 3);
ok(pos.map(settledDigit).reverse().join('') === '128', 'odometer settles on 128');
ok(odometerPositions(127.5, 3)[1] === 2, 'tens column still while ones rolls mid-unit');
ok(Math.abs(odometerPositions(129.5, 3)[1] - 2.5) < 1e-9, 'tens column turns over during 129->130 carry');
ok(Math.abs(odometerPositions(199.5, 3)[2] - 1.5) < 1e-9, 'hundreds turns during 199->200');

// 3. time: mixed radix carry, never :60, countdown borrows correctly
const seen = new Set<string>();
for (let i = 0; i <= 1000; i++) seen.add(formatClock(clockSeconds(i / 1000, 48, 60)));
ok(!Array.from(seen).some((s) => /:6\d/.test(s)), 'never shows :60+');
ok(seen.has('00:59') && seen.has('01:00'), 'passes 00:59 then 01:00');
ok(formatClock(clockSeconds(1, 48, 60)) === '01:00', 'clock lands 01:00');
const down = new Set<string>();
for (let i = 0; i <= 1000; i++) down.add(formatClock(clockSeconds(i / 1000, 62, 58)));
ok(down.has('01:00') && down.has('00:59') && !Array.from(down).some((s) => /:6\d/.test(s)), 'countdown 01:00 -> 00:59');
ok(formatClock(clockSeconds(1, 62, 58)) === '00:58', 'countdown lands 00:58');
ok(formatClock(9 * 3600 + 59 * 60, 'hh:mm') === '09:59' && formatClock(10 * 3600, 'hh:mm') === '10:00', 'hh:mm carry 09:59 -> 10:00');
ok(formatClock(23 * 3600 + 59 * 60 + 60, 'hh:mm') === '00:00', '23:59 -> 00:00 wraps day');
const carry = clockRoll(59.8, 1);
ok(carry.map((c) => c.next).join('') === '01:00' && carry[0].phase === 0 && carry[1].phase > 0 && carry[3].phase > 0, 'roll 00:59->01:00 moves only changed digits');
const borrow = clockRoll(59.2, -1);
ok(borrow.map((c) => c.next).join('') === '00:59' && borrow[1].phase > 0, 'countdown roll 01:00->00:59');

// 4. seek-safety: evaluating frames in random order gives identical results
const order = Array.from({length: 200}, (_, i) => i);
const a = order.map((f) => JSON.stringify(pose(f, [{f: 10, x: 0, y: 0}, {f: 40, x: 100, y: 50, s: 0.5}], 30)));
const shuffled = [...order].sort((x, y) => ((x * 7919) % 211) - ((y * 7919) % 211));
const b: string[] = [];
shuffled.forEach((f) => (b[f] = JSON.stringify(pose(f, [{f: 10, x: 0, y: 0}, {f: 40, x: 100, y: 50, s: 0.5}], 30))));
ok(a.every((v, i) => v === b[i]), 'pose() is order independent');
const end = pose(40, [{f: 10, x: 0, y: 0}, {f: 40, x: 100, y: 50, s: 0.5}], 30);
ok(end.x === 100 && end.y === 50 && end.s === 0.5, 'move lands exactly on slot');

const hold = [{f: 0, x: 0, y: 500}, {f: 30, x: 0, y: 500}, {f: 50, x: 300, y: 900}];
ok(pose(15, hold, 60).y === 500, 'hold segment never arcs (items waiting in place stay put)');
ok(pose(40, hold, 60).y < 900 - 1 && pose(50, hold, 60).y === 900, 'travel segment arcs and still lands exactly');

console.log(`motion_logic_test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
