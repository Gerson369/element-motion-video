// Checklist: rows arrive, then each check mark is drawn at its own spoken moment.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {mix, progress} from './core/timing';
import {useTheme} from './theme';
import {roughFilter} from './RoughDefs';

export type CheckItem = {text: string; appear: number; check?: number};
type Props = {id: string; items: CheckItem[]; width: number; fontSize?: number; rowGap?: number; strike?: boolean};

const TICK = 'M 8 30 L 24 46 L 54 12';

export const Checklist: React.FC<Props> = ({id, items, width, fontSize = 56, rowGap = 28, strike = false}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const done = items.filter((it) => it.check !== undefined && frame >= it.check + 10).length;
  return (
    <div data-emv-id={id} data-emv-kind="checklist" data-emv-value={`${done}/${items.length}`}
      style={{width, display: 'flex', flexDirection: 'column', gap: rowGap, fontFamily: th.font}}>
      {items.map((it, i) => {
        const a = progress(frame, it.appear, 12, 'out');
        const c = it.check === undefined ? 0 : progress(frame, it.check, 10, 'out');
        const evo = evolvePath(c, TICK);
        const box = fontSize * 1.05;
        return (
          <div key={i} data-emv-id={`${id}-row${i}`} data-emv-kind="text" data-emv-value={it.text}
            data-emv-visible={a > 0 ? '1' : '0'}
            style={{display: 'flex', alignItems: 'center', gap: 26, opacity: a, transform: `translateX(${mix(a, 40, 0)}px)`,
              width, overflow: 'hidden'}}>
            <svg width={box} height={box} viewBox="0 0 64 64" style={{flex: 'none'}}>
              <g filter={roughFilter(th.rough)}>
                <rect x={4} y={4} width={56} height={56} rx={th.rough ? 14 : 8} fill={th.surface} stroke={th.line} strokeWidth={4} />
                <path d={TICK} fill="none" stroke={th.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
              </g>
            </svg>
            <span style={{fontSize, fontWeight: 700, color: c >= 1 ? th.muted : th.ink, whiteSpace: 'nowrap',
              textDecoration: strike && c >= 1 ? 'line-through' : 'none'}}>{it.text}</span>
          </div>
        );
      })}
    </div>
  );
};
