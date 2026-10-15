// Pure timing helpers. Every value is a function of the current frame only (seek-safe).
import {Easing, interpolate} from 'remotion';

export type EaseName = 'linear' | 'out' | 'inOut' | 'outBack' | 'outExpo';

export const EASE: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  out: Easing.bezier(0.16, 1, 0.3, 1), // enter: arrive with momentum
  inOut: Easing.bezier(0.65, 0, 0.35, 1), // move / give way
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1), // small overshoot, use sparingly
  outExpo: Easing.out(Easing.exp), // counters: decelerate into landing
};

export const sec = (fps: number, s: number) => Math.round(s * fps);

/** 0..1 progress of a window [start, start+duration), clamped on both sides. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  ease: EaseName = 'out',
): number => {
  if (duration <= 0) return frame >= start ? 1 : 0;
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (t <= 0) return 0;
  if (t >= 1) return 1; // exact landing, never 0.99999
  return EASE[ease](t);
};

export const mix = (p: number, a: number, b: number) => a + (b - a) * p;

/** Stagger: start frame of item i. */
export const staggerStart = (start: number, i: number, gap: number) => start + i * gap;
