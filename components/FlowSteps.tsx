// Flow: nodes light up in order; connectors draw between them (process explanation).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix, progress} from './core/timing';
import {useTheme} from './theme';

type Props = {id: string; steps: string[]; start: number; gap: number; width: number; fontSize?: number};

export const FlowSteps: React.FC<Props> = ({id, steps, start, gap, width, fontSize = 48}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const active = steps.filter((_, i) => frame >= start + i * gap).length;
  const nodeW = (width - (steps.length - 1) * 60) / steps.length;
  return (
    <div data-emv-id={id} data-emv-kind="flow" data-emv-value={`${active}/${steps.length}`}
      style={{width, display: 'flex', alignItems: 'center', fontFamily: th.font}}>
      {steps.map((s, i) => {
        const a = progress(frame, start + i * gap, 12, 'outBack');
        const l = progress(frame, start + i * gap + 6, gap - 8, 'inOut');
        return (
          <React.Fragment key={i}>
            <div data-emv-id={`${id}-n${i}`} data-emv-kind="text" data-emv-value={s}
              style={{width: nodeW, padding: '22px 10px', boxSizing: 'border-box', textAlign: 'center', fontSize, fontWeight: 800,
                borderRadius: th.radius, border: `${th.stroke - 1}px solid ${a > 0 ? th.line : 'transparent'}`,
                background: i === active - 1 ? th.marker : th.surface, color: th.ink, opacity: a,
                transform: `scale(${mix(a, 0.7, 1)})`, whiteSpace: 'nowrap', overflow: 'hidden'}}>{s}</div>
            {i < steps.length - 1 ? (
              <div style={{width: 60, height: th.stroke, background: th.line, transform: `scaleX(${l})`, transformOrigin: 'left'}} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
