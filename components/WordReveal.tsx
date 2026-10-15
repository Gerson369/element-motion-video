// Text enters word-group by word-group; keywords get a marker sweep AFTER they are spoken.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix, progress} from './core/timing';
import {useTheme} from './theme';

export type Word = {t: string; hl?: boolean; color?: 'accent' | 'ink' | 'muted'};
type Props = {
  id: string;
  words: Word[];
  start: number;
  gap?: number; // frames between word groups
  dur?: number; // frames per word entrance
  mode?: 'pop' | 'slide' | 'fade';
  fontSize?: number;
  weight?: number;
  width: number;
  align?: 'left' | 'center';
  markerDelay?: number; // frames after the word lands
  lineHeight?: number;
};

export const WordReveal: React.FC<Props> = ({
  id, words, start, gap = 5, dur = 10, mode = 'pop', fontSize = 96, weight = 800, width,
  align = 'left', markerDelay = 4, lineHeight = 1.25,
}) => {
  const frame = useCurrentFrame();
  const th = useTheme();
  const shown = words.filter((_, i) => frame >= start + i * gap).map((w) => w.t).join('');
  return (
    <div
      data-emv-id={id} data-emv-kind="text" data-emv-value={shown}
      data-emv-visible={shown ? '1' : '0'}
      style={{width, fontFamily: th.font, fontSize, fontWeight: weight, lineHeight, color: th.ink,
        textAlign: align, wordBreak: 'keep-all', overflowWrap: 'normal'}}
    >
      {words.map((w, i) => {
        const s = start + i * gap;
        const p = progress(frame, s, dur, mode === 'pop' ? 'outBack' : 'out');
        const o = progress(frame, s, Math.max(1, Math.round(dur * 0.6)), 'out');
        const ty = mode === 'fade' ? 0 : mix(p, mode === 'slide' ? 40 : 24, 0);
        const sc = mode === 'pop' ? mix(p, 0.6, 1) : 1;
        const m = w.hl ? progress(frame, s + dur + markerDelay, 12, 'out') : 0;
        const color = w.color === 'accent' || w.hl ? th.accent : w.color === 'muted' ? th.muted : th.ink;
        return (
          <span key={i} style={{display: 'inline-block', position: 'relative', opacity: o,
            transform: `translateY(${ty}px) scale(${sc})`, transformOrigin: '50% 80%', color}}>
            {w.hl ? (
              <span style={{position: 'absolute', left: '-0.06em', right: '-0.06em', bottom: '0.06em',
                height: '0.42em', background: th.marker, borderRadius: th.rough ? '40% 30% 45% 35%' : 2,
                transform: `scaleX(${m}) rotate(${th.rough ? -1.2 : 0}deg)`, transformOrigin: 'left center', zIndex: 0}} />
            ) : null}
            <span style={{position: 'relative', zIndex: 1}}>{w.t}</span>
          </span>
        );
      })}
    </div>
  );
};
