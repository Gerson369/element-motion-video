// Test-only probe. When inputProps.probe === true, logs every [data-emv-id] element's
// visible value and bounding box so scripts/render_check.mjs can assert on REAL renders.
import React, {useLayoutEffect} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';

export const Probe: React.FC<{enabled?: boolean}> = ({enabled}) => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    if (!enabled) return;
    const handle = delayRender('emv-probe');
    const id = requestAnimationFrame(() => {
      const root = document.querySelector<HTMLElement>('[data-emv-root]')?.getBoundingClientRect();
      const ox = root?.left ?? 0;
      const oy = root?.top ?? 0;
      const items = Array.from(document.querySelectorAll<HTMLElement>('[data-emv-id]')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          id: el.dataset.emvId,
          kind: el.dataset.emvKind ?? '',
          value: el.dataset.emvValue ?? '',
          visible: el.dataset.emvVisible !== '0',
          bleed: el.dataset.emvBleed === '1',
          // horizontal only: vertical overflow is normal for rolling digit strips and entrance offsets
          overflow: ['text', 'caption', 'number', 'clock'].includes(el.dataset.emvKind ?? '') && el.scrollWidth > el.clientWidth + 12,
          rect: [r.left - ox, r.top - oy, r.right - ox, r.bottom - oy].map((n) => Math.round(n)),
        };
      });
      console.log('EMV_PROBE ' + JSON.stringify({frame, items}));
      continueRender(handle);
    });
    return () => {
      cancelAnimationFrame(id);
      continueRender(handle);
    };
  }, [enabled, frame]);
  return enabled ? <div data-emv-root style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}} /> : null;
};
