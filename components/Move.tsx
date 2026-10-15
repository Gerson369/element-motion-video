// Magic-move: one element travels between layout slots (give way / transfer email item -> todo).
// Keyframes are absolute frames; between keys we ease in-out; optional arc lifts the path.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix, progress} from './core/timing';

export type Key = {f: number; x: number; y: number; s?: number; o?: number; r?: number; arc?: number};
// `arc` on a key lifts the segment ARRIVING at that key. The component-level `arc` is only a default
// for real travels (>= 120px); holds and small entrance drifts never arc.
type Props = {id?: string; keys: Key[]; arc?: number; children: React.ReactNode; z?: number};

export const pose = (frame: number, keys: Key[], arc = 0) => {
  const ks = [...keys].sort((a, b) => a.f - b.f);
  if (frame <= ks[0].f) return {...ks[0], s: ks[0].s ?? 1, o: ks[0].o ?? 1, r: ks[0].r ?? 0};
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (frame < b.f) {
      const p = progress(frame, a.f, b.f - a.f, 'inOut');
      const segArc = b.arc ?? (Math.hypot(b.x - a.x, b.y - a.y) >= 120 ? arc : 0);
      return {f: frame, x: mix(p, a.x, b.x), y: mix(p, a.y, b.y) - segArc * Math.sin(Math.PI * p),
        s: mix(p, a.s ?? 1, b.s ?? 1), o: mix(p, a.o ?? 1, b.o ?? 1), r: mix(p, a.r ?? 0, b.r ?? 0)};
    }
  }
  const z = ks[ks.length - 1];
  return {...z, s: z.s ?? 1, o: z.o ?? 1, r: z.r ?? 0};
};

export const Move: React.FC<Props> = ({id, keys, arc = 0, children, z}) => {
  const frame = useCurrentFrame();
  const q = pose(frame, keys, arc);
  return (
    <div data-emv-id={id} data-emv-kind="move" data-emv-visible={q.o > 0.01 ? '1' : '0'}
      style={{position: 'absolute', left: q.x, top: q.y, opacity: q.o, zIndex: z,
        transform: `scale(${q.s}) rotate(${q.r}deg)`, transformOrigin: 'left top'}}>
      {children}
    </div>
  );
};
