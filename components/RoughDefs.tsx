// Deterministic hand-drawn wobble (fixed seed => identical on every frame / every seek).
import React from 'react';
export const RoughDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="emv-rough" x="-5%" y="-20%" width="110%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={4} />
      </filter>
    </defs>
  </svg>
);
export const roughFilter = (on: boolean) => (on ? 'url(#emv-rough)' : undefined);
