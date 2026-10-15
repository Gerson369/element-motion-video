// Odometer: lowest column turns continuously, higher columns only turn over on carry.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {columnsFor, countValue, odometerPositions} from './core/number';
import {EaseName, progress} from './core/timing';
import {useTheme} from './theme';

type Props = {id: string; from?: number; to: number; start: number; dur: number; fontSize?: number;
  suffix?: string; ease?: EaseName; color?: string};

export const RollingNumber: React.FC<Props> = ({id, from = 0, to, start, dur, fontSize = 200, suffix = '',
  ease = 'outExpo', color}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = progress(frame, start, dur, ease);
  const v = p >= 1 ? to : from + (to - from) * p; // continuous, exact at the end
  const cols = columnsFor(to, from);
  const pos = odometerPositions(v, cols).reverse(); // highest first
  const h = fontSize * 1.1;
  const shownValue = String(countValue(p, from, to, 0)) + suffix;
  return (
    <div data-emv-id={id} data-emv-kind="number" data-emv-value={shownValue} data-emv-visible={frame >= start ? '1' : '0'}
      style={{display: 'flex', alignItems: 'flex-end', fontFamily: th.numFont, fontSize, fontWeight: 900,
        color: color ?? th.accent, fontVariantNumeric: 'tabular-nums', lineHeight: `${h}px`, opacity: frame >= start ? 1 : 0}}>
      {pos.map((ps, i) => {
        // hide leading zeros of columns the value has not reached yet
        const lead = i < cols - 1 && Math.floor(v / Math.pow(10, cols - 1 - i)) === 0 && ps < 0.001;
        return (
          <div key={i} style={{height: h, overflow: 'hidden', width: '0.62em', opacity: lead ? 0 : 1}}>
            <div style={{transform: `translateY(${-ps * h}px)`}}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
                <div key={j} style={{height: h, textAlign: 'center'}}>{d}</div>
              ))}
            </div>
          </div>
        );
      })}
      {suffix ? <div style={{fontSize: fontSize * 0.42, marginLeft: 12, marginBottom: fontSize * 0.14, color: th.ink}}>{suffix}</div> : null}
    </div>
  );
};
