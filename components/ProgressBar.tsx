// Progress bar and its % label share ONE progress value, so they can never disagree.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {countValue} from './core/number';
import {EaseName, progress} from './core/timing';
import {useTheme} from './theme';

type Props = {id: string; target: number; start: number; dur: number; width: number; height?: number;
  showLabel?: boolean; ease?: EaseName; label?: string};

export const ProgressBar: React.FC<Props> = ({id, target, start, dur, width, height = 36, showLabel = true,
  ease = 'outExpo', label}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = progress(frame, start, dur, ease);
  const pct = countValue(p, 0, Math.round(target * 100), 0);
  const fill = (p >= 1 ? target : target * p) * width;
  const text = `${pct}%`;
  return (
    <div data-emv-id={id} data-emv-kind="progress" data-emv-value={text} data-emv-visible={frame >= start ? '1' : '0'}
      style={{width, fontFamily: th.font, opacity: progress(frame, start - 6, 6)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: th.muted,
        fontSize: 40, fontWeight: 700, marginBottom: 14}}>
        <span>{label ?? ''}</span>
        {showLabel ? <span style={{color: th.accent, fontSize: 56, fontWeight: 900, fontVariantNumeric: 'tabular-nums'}}>{text}</span> : null}
      </div>
      <div style={{width, height, borderRadius: height / 2, background: th.surface, border: `${Math.max(2, th.stroke - 2)}px solid ${th.line}`,
        overflow: 'hidden', boxSizing: 'border-box'}}>
        <div style={{width: fill, height: '100%', background: th.accent, borderRadius: height / 2}} />
      </div>
    </div>
  );
};
