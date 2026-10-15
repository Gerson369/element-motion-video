// Arrow that draws along a path; the head appears only when the line arrives.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {evolvePath, getPointAtLength, getLength, getTangentAtLength} from '@remotion/paths';
import {progress} from './core/timing';
import {useTheme} from './theme';
import {roughFilter} from './RoughDefs';

type Props = {id: string; d: string; start: number; dur: number; color?: string; width?: number; head?: number};

export const DrawArrow: React.FC<Props> = ({id, d, start, dur, color, width, head = 34}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const p = progress(frame, start, dur, 'inOut');
  const evo = evolvePath(p, d);
  const len = getLength(d);
  const end = getPointAtLength(d, len);
  const tan = getTangentAtLength(d, len);
  const ang = Math.atan2(tan.y, tan.x);
  const hp = progress(frame, start + dur - 4, 6, 'out');
  const sw = width ?? th.stroke;
  const c = color ?? th.line;
  const a1 = [end.x - head * Math.cos(ang - 0.5), end.y - head * Math.sin(ang - 0.5)];
  const a2 = [end.x - head * Math.cos(ang + 0.5), end.y - head * Math.sin(ang + 0.5)];
  return (
    <svg data-emv-id={id} data-emv-kind="arrow" data-emv-value={p >= 1 ? 'done' : p > 0 ? 'drawing' : 'idle'}
      data-emv-visible={p > 0 ? '1' : '0'} data-emv-bleed="1"
      width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g filter={roughFilter(th.rough)}>
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
        <path d={`M ${a1[0]} ${a1[1]} L ${end.x} ${end.y} L ${a2[0]} ${a2[1]}`} fill="none" stroke={c}
          strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity={hp} />
      </g>
    </svg>
  );
};
