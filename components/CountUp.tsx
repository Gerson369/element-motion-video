// Counter: decelerates into the landing and stops EXACTLY on the target.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {formatNumber, NumberFormat, countValue} from './core/number';
import {EaseName, mix, progress} from './core/timing';
import {useTheme} from './theme';

type Props = {
  id: string; from?: number; to: number; start: number; dur: number; format?: NumberFormat;
  fontSize?: number; ease?: EaseName; settle?: boolean; color?: string;
};

export const CountUp: React.FC<Props> = ({id, from = 0, to, start, dur, format = {}, fontSize = 200,
  ease = 'outExpo', settle = true, color}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = progress(frame, start, dur, ease);
  const text = formatNumber(countValue(p, from, to, format.decimals ?? 0), format);
  const pop = settle ? progress(frame, start + dur, 8, 'out') : 1;
  const sc = settle && frame >= start + dur ? mix(Math.sin(pop * Math.PI), 1, 1.06) : 1;
  return (
    <div data-emv-id={id} data-emv-kind="number" data-emv-value={text} data-emv-visible={frame >= start ? '1' : '0'}
      style={{fontFamily: th.numFont, fontSize, fontWeight: 900, lineHeight: 1, color: color ?? th.accent,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', transform: `scale(${sc})`,
        transformOrigin: 'left bottom', whiteSpace: 'nowrap', opacity: frame >= start ? 1 : 0}}>
      {text}
    </div>
  );
};
