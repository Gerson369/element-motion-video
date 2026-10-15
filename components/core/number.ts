// Pure number logic: counters land exactly on the target; odometer columns carry correctly.

export type NumberFormat = {
  decimals?: number;
  grouping?: boolean; // 12,800
  prefix?: string;
  suffix?: string;
  cnUnit?: boolean; // 1.2万 / 3.4亿 (only when the script itself uses these units)
};

const round = (v: number, d: number) => {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
};

/** Counter value at progress p (0..1). p>=1 returns `to` EXACTLY. */
export const countValue = (p: number, from: number, to: number, decimals = 0): number => {
  if (p >= 1) return to;
  if (p <= 0) return from;
  const v = round(from + (to - from) * p, decimals);
  // never overshoot the target while still moving
  return to >= from ? Math.min(v, to) : Math.max(v, to);
};

export const formatNumber = (v: number, f: NumberFormat = {}): string => {
  const d = f.decimals ?? 0;
  let body: string;
  if (f.cnUnit && Math.abs(v) >= 1e8) body = (v / 1e8).toFixed(Math.max(d, 1)) + '亿';
  else if (f.cnUnit && Math.abs(v) >= 1e4) body = (v / 1e4).toFixed(Math.max(d, 1)) + '万';
  else {
    const fixed = v.toFixed(d);
    if (f.grouping) {
      const [i, frac] = fixed.split('.');
      body = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '');
    } else body = fixed;
  }
  return `${f.prefix ?? ''}${body}${f.suffix ?? ''}`;
};

/**
 * Odometer positions. value is continuous (already scaled to an integer grid,
 * e.g. 12.5 with 1 decimal -> 125). Returns one position per column, lowest first.
 * Column k shows digit floor(pos) and rolls toward floor(pos)+1 by the fractional part.
 * The lowest column turns continuously; higher columns only turn over on carry.
 */
export const odometerPositions = (value: number, columns: number): number[] => {
  const v = Math.max(0, value);
  const out: number[] = [];
  for (let k = 0; k < columns; k++) {
    const unit = Math.pow(10, k);
    if (k === 0) {
      out.push(v % 10);
      continue;
    }
    const base = Math.floor(v / unit);
    const rest = v - base * unit; // 0..unit
    const turn = Math.max(0, Math.min(1, rest - (unit - 1)));
    out.push((base % 10) + turn);
  }
  return out;
};

/** Digit currently fully shown by an odometer column position (used by checks). */
export const settledDigit = (pos: number) => ((Math.round(pos) % 10) + 10) % 10;

/** How many columns a target needs (fixed width = no layout jump while counting). */
export const columnsFor = (to: number, from = 0) =>
  Math.max(String(Math.floor(Math.abs(to))).length, String(Math.floor(Math.abs(from))).length);
