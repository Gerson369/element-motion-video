// Regression composition: countdown carry (01:02 -> 00:58) + decimal counter landing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ClockRoll, CountUp, Probe, ThemeContext, THEMES} from '../../components';

export const ClockTest: React.FC<{probe?: boolean}> = ({probe = false}) => (
  <ThemeContext.Provider value={THEMES.editorial}>
    <AbsoluteFill style={{background: '#fff', padding: 120, gap: 80}}>
      <ClockRoll id="countdown" fromSec={62} toSec={58} start={0} dur={110} fontSize={200} />
      <CountUp id="rate" from={0} to={12.5} start={0} dur={60} format={{decimals: 1, suffix: '%'}} fontSize={180} />
      <ClockRoll id="hhmm" fromSec={9 * 3600 + 58 * 60} toSec={10 * 3600 + 1 * 60} start={0} dur={90} fmt="hh:mm" fontSize={160} />
      <Probe enabled={probe} />
    </AbsoluteFill>
  </ThemeContext.Provider>
);
