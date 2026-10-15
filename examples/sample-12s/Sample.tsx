import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  Captions, Checklist, ClockRoll, DrawArrow, Move, Probe, ProgressBar, RollingNumber, RoughDefs,
  ThemeContext, THEMES, WordReveal, progress, useTheme,
} from '../../components';
import plan from './motion-plan.json';

const EMAIL_ITEMS = ['周五前发报价', '确认会议时间', '回复客户问题'];
const TODO_X = 80;
const TODO_Y = 1080;
const ROW = 56 * 1.05 + 28; // checklist row height (box + gap)
const TEXT_X = TODO_X + 56 * 1.05 + 26;

const EmailCard: React.FC = () => {
  const th = useTheme();
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'relative', width: 920, height: 340, boxSizing: 'border-box', padding: '30px 40px', borderRadius: th.radius,
      background: th.surface, border: `${th.stroke - 2}px solid ${th.line}`, fontFamily: th.font}}>
      <div style={{fontSize: 40, fontWeight: 800, color: th.muted}}>新邮件 · 来自客户</div>
      <div style={{height: 3, background: th.line, opacity: 0.15, margin: '18px 0 0'}} />
      {/* ghost lines stay behind where each item left: the card is the source, not a dead box */}
      {EMAIL_ITEMS.map((t, i) => {
        const left = progress(frame, 286 + i * 12, 10, 'out');
        return (
          <div key={t} style={{position: 'absolute', left: 40, top: 110 + i * 70, display: 'flex', alignItems: 'center', gap: 16,
            opacity: left * 0.9, fontSize: 34, fontWeight: 700, color: th.muted}}>
            <div style={{width: 260 * left, height: 14, borderRadius: 7, background: th.marker}} />
            <span>已移入待办</span>
          </div>
        );
      })}
    </div>
  );
};

// While an item is carried it becomes an opaque pill on top (z-order makes crossings read cleanly);
// the pill fades out just before landing so the hand-off to the checklist row is invisible.
const Lifted: React.FC<{start: number; children: React.ReactNode}> = ({start, children}) => {
  const th = useTheme();
  const frame = useCurrentFrame();
  const lift = progress(frame, start, 4, 'out') * (1 - progress(frame, start + 12, 6, 'out'));
  return (
    <div style={{position: 'relative', fontFamily: th.font, fontSize: 48, fontWeight: 700, color: th.ink, whiteSpace: 'nowrap'}}>
      <div style={{position: 'absolute', left: -18, right: -18, top: -10, bottom: -10, borderRadius: th.radius,
        background: th.surface, opacity: lift, boxShadow: `0 10px 24px rgba(0,0,0,${0.16 * lift})`}} />
      <span style={{position: 'relative'}}>{children}</span>
    </div>
  );
};

const Stage: React.FC<{probe?: boolean}> = ({probe}) => {
  const th = useTheme();
  return (
    <AbsoluteFill style={{background: th.bg}}>
      <RoughDefs />
      {/* A. headline: enters word by word, then gives way to the top anchor slot */}
      <Move keys={[{f: 80, x: 80, y: 560, s: 1}, {f: 100, x: 80, y: 150, s: 0.55}]}>
        <WordReveal id="headline" width={920} fontSize={120} start={6} gap={7}
          words={[{t: '每天'}, {t: '被'}, {t: '邮件', hl: true}, {t: '追着跑？'}]} />
      </Move>

      {/* B. numbers: odometer + synced progress, then the group shrinks into a chip */}
      <Move keys={[{f: 90, x: 80, y: 560, o: 0}, {f: 98, x: 80, y: 520, o: 1}, {f: 176, x: 80, y: 520, s: 1}, {f: 196, x: 80, y: 360, s: 0.4}]}>
        <div style={{width: 920}}>
          <WordReveal id="mails-label" width={920} fontSize={48} weight={700} start={96} gap={4} mode="fade"
            words={[{t: '示例：', color: 'muted'}, {t: '一天收到', color: 'muted'}]} />
          <div style={{height: 20}} />
          <RollingNumber id="mails" to={128} start={104} dur={50} suffix="封" fontSize={220} />
          <div style={{height: 60}} />
          <ProgressBar id="handle" target={0.76} start={138} dur={36} width={920} label="需要亲自处理" />
        </div>
      </Move>

      {/* C. time: a real clock (mixed-radix carry), then shrinks into a chip */}
      <Move keys={[{f: 182, x: 130, y: 700, o: 0}, {f: 192, x: 130, y: 660, o: 1}, {f: 250, x: 130, y: 660, s: 1}, {f: 268, x: 650, y: 378, s: 0.38}]}>
        <div style={{width: 820}}>
          <WordReveal id="clock-label" width={820} fontSize={48} weight={700} start={186} gap={4} mode="fade"
            words={[{t: '处理一封', color: 'muted'}, {t: '≈', color: 'muted'}]} />
          <div style={{height: 24}} />
          <ClockRoll id="clock" fromSec={48} toSec={60} start={196} dur={42} fontSize={200} />
        </div>
      </Move>

      {/* D. diagram: email items travel into the todo list, then get checked off */}
      <Move keys={[{f: 262, x: 80, y: 630, o: 0}, {f: 274, x: 80, y: 590, o: 1}]}>
        <EmailCard />
      </Move>
      <Move keys={[{f: 284, x: 80, y: 1000, o: 0}, {f: 296, x: 80, y: 990, o: 1}]}>
        <div style={{fontFamily: th.font, fontSize: 44, fontWeight: 800, color: th.ink}}>待办</div>
      </Move>
      <DrawArrow id="arrow" d="M 960 790 C 1000 880, 1000 970, 940 1060" start={276} dur={22} />
      {EMAIL_ITEMS.map((t, i) => {
        const s = 286 + i * 12;
        return (
          <Move key={t} arc={60} z={20 - i} keys={[
            {f: 268 + i * 3, x: 120, y: 700 + i * 70, o: 0}, {f: 278 + i * 3, x: 120, y: 690 + i * 70, o: 1},
            {f: s, x: 120, y: 690 + i * 70, o: 1}, {f: s + 18, x: TEXT_X, y: TODO_Y + 6 + i * ROW, o: 1},
            {f: s + 19, x: TEXT_X, y: TODO_Y + 6 + i * ROW, o: 0}]}>
            <Lifted start={s}>{t}</Lifted>
          </Move>
        );
      })}
      <div style={{position: 'absolute', left: TODO_X, top: TODO_Y}}>
        <Checklist id="todo" width={920} fontSize={56} items={EMAIL_ITEMS.map((t, i) => ({
          text: t, appear: 286 + i * 12 + 18, check: 326 + i * 12}))} />
      </div>

      <Captions cues={plan.captions} />
      <Probe enabled={probe} />
    </AbsoluteFill>
  );
};

export const Sample: React.FC<{style?: string; probe?: boolean}> = ({style = 'handnote', probe = false}) => (
  <ThemeContext.Provider value={THEMES[style] ?? THEMES.handnote}>
    <Stage probe={probe} />
  </ThemeContext.Provider>
);
