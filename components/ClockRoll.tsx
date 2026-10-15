// Clock / countdown. Each digit rolls only when IT changes; carries are mixed-radix (59 -> 00).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ClockFormat, clockRoll, clockSeconds, formatClock} from './core/clock';
import {progress} from './core/timing';
import {useTheme} from './theme';

type Props = {id: string; fromSec: number; toSec: number; start: number; dur: number; fmt?: ClockFormat;
  fontSize?: number; card?: boolean; color?: string};

export const ClockRoll: React.FC<Props> = ({id, fromSec, toSec, start, dur, fmt = 'mm:ss', fontSize = 220,
  card = true, color}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = progress(frame, start, dur, 'linear'); // a clock ticks at constant speed
  const dir: 1 | -1 = toSec >= fromSec ? 1 : -1;
  const t = p >= 1 ? toSec : fromSec + (toSec - fromSec) * p;
  const chars = p >= 1 ? formatClock(toSec, fmt).split('').map((c) => ({cur: c, next: c, phase: 0})) : clockRoll(t, dir, fmt);
  const shown = formatClock(clockSeconds(p, fromSec, toSec), fmt);
  const h = fontSize * 1.18;
  return (
    <div data-emv-id={id} data-emv-kind="clock" data-emv-value={shown} data-emv-visible={frame >= start ? '1' : '0'}
      style={{display: 'flex', gap: fontSize * 0.06, fontFamily: th.numFont, fontSize, fontWeight: 900,
        color: color ?? th.ink, fontVariantNumeric: 'tabular-nums', lineHeight: `${h}px`}}>
      {chars.map((c, i) =>
        c.cur === ':' ? (
          <div key={i} style={{height: h, width: '0.36em', textAlign: 'center', color: th.muted}}>:</div>
        ) : (
          <div key={i} style={{height: h, width: '0.7em', overflow: 'hidden', textAlign: 'center',
            background: card ? th.surface : undefined, borderRadius: th.radius,
            boxShadow: card ? '0 6px 0 rgba(0,0,0,0.08)' : undefined, position: 'relative'}}>
            <div style={{transform: `translateY(${(dir === 1 ? -1 : 1) * c.phase * h}px)`}}>
              {dir === 1 ? (<><div style={{height: h}}>{c.cur}</div><div style={{height: h}}>{c.next}</div></>)
                : (<div style={{position: 'relative'}}>
                    <div style={{height: h, position: 'absolute', top: -h, width: '100%'}}>{c.next}</div>
                    <div style={{height: h}}>{c.cur}</div></div>)}
            </div>
            {card ? <div style={{position: 'absolute', left: 0, right: 0, top: h / 2, height: 2, background: th.bg, opacity: 0.6}} /> : null}
          </div>
        ),
      )}
    </div>
  );
};
