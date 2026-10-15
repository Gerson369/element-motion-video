// Full subtitles live in their OWN band. Main stage only keeps keywords / numbers / relations.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {progress} from './core/timing';
import {SAFE, useTheme} from './theme';

export type Cue = {text: string; from: number; to: number};
type Props = {cues: Cue[]; fontSize?: number};

export const Captions: React.FC<Props> = ({cues, fontSize = 50}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const cue = cues.find((c) => frame >= c.from && frame < c.to);
  const o = cue ? Math.min(progress(frame, cue.from, 4, 'linear'), 1 - progress(frame, cue.to - 3, 3, 'linear')) : 0;
  const w = SAFE.width - SAFE.side * 2;
  return (
    <div style={{position: 'absolute', left: SAFE.side, top: SAFE.captionTop + 120, width: w, display: 'flex', justifyContent: 'center'}}>
      <div data-emv-id="captions" data-emv-kind="caption" data-emv-value={cue?.text ?? ''} data-emv-visible={cue ? '1' : '0'}
        style={{maxWidth: w, padding: '14px 28px', borderRadius: 14, fontFamily: th.font, fontSize, fontWeight: 700,
          lineHeight: 1.35, color: th.ink, background: th.name === 'tech' ? 'rgba(20,27,51,0.85)' : 'rgba(255,255,255,0.85)',
          textAlign: 'center', opacity: o, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {cue?.text ?? ''}
      </div>
    </div>
  );
};
