import React from 'react';
import {Composition} from 'remotion';
import {Sample} from './Sample';
import {ClockTest} from './ClockTest';
import cfg from './project.config.json';
import plan from './motion-plan.json';

export const Root: React.FC = () => (
  <>
    <Composition id="EMV-Sample" component={Sample} durationInFrames={plan.durationInFrames} fps={cfg.fps}
      width={cfg.width} height={cfg.height} defaultProps={{style: cfg.style, probe: false}} />
    <Composition id="EMV-ClockTest" component={ClockTest} durationInFrames={120} fps={30} width={1080} height={1920}
      defaultProps={{probe: false}} />
  </>
);
