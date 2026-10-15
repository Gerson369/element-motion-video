// Time is NOT a decimal number. 00:59 -> 01:00, never 00:60. Mixed-radix carry per column.

export type ClockFormat = 'mm:ss' | 'hh:mm' | 'hh:mm:ss';

/** Discrete ticking clock: integer seconds shown at progress p. */
export const clockSeconds = (p: number, fromSec: number, toSec: number): number => {
  if (p >= 1) return toSec;
  if (p <= 0) return fromSec;
  const v = fromSec + (toSec - fromSec) * p;
  return toSec >= fromSec ? Math.floor(v) : Math.ceil(v);
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Format whole seconds (hh:mm uses seconds as minutes-of-day input * 60 is NOT assumed: pass seconds). */
export const formatClock = (totalSec: number, fmt: ClockFormat = 'mm:ss'): string => {
  const s = Math.max(0, Math.floor(totalSec));
  const hh = Math.floor(s / 3600) % 24;
  const mm = Math.floor(s / 60) % 60;
  const ss = s % 60;
  const mmTotal = Math.floor(s / 60); // mm:ss may exceed 59 minutes only if caller wants it
  if (fmt === 'mm:ss') return `${pad(mmTotal % 100)}:${pad(ss)}`;
  if (fmt === 'hh:mm') return `${pad(hh)}:${pad(mm)}`;
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
};

/** Characters of a formatted clock split into digit slots and separators. */
export const clockChars = (totalSec: number, fmt: ClockFormat = 'mm:ss') =>
  formatClock(totalSec, fmt).split('');

/**
 * Per-character roll state for a continuous time t (seconds) moving in `dir`.
 * Each tick, characters that change roll from `cur` to `next` during the last `rollFrac`
 * of the second. Characters that do not change stay still. Works for count-up and countdown,
 * including carries such as 00:59 -> 01:00 and 01:00 -> 00:59.
 */
export const clockRoll = (
  t: number,
  dir: 1 | -1,
  fmt: ClockFormat = 'mm:ss',
  rollFrac = 0.35,
) => {
  const whole = dir === 1 ? Math.floor(t) : Math.ceil(t);
  const frac = Math.abs(t - whole);
  const cur = clockChars(whole, fmt);
  const next = clockChars(whole + dir, fmt);
  const phase = Math.max(0, Math.min(1, (frac - (1 - rollFrac)) / rollFrac));
  return cur.map((c, i) => ({cur: c, next: next[i], phase: c === next[i] ? 0 : phase}));
};
