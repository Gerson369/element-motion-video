// Style is data, not code. Project config picks one of the Style Locks in styles/*.md.
import React from 'react';

export type MotionTheme = {
  name: 'handnote' | 'editorial' | 'tech' | string;
  bg: string;
  ink: string; // main text
  muted: string; // secondary text
  accent: string; // ONE accent for key numbers / highlights
  marker: string; // highlight fill under keywords
  line: string; // arrows, rules, bars
  surface: string; // cards
  font: string;
  numFont: string;
  radius: number;
  stroke: number;
  rough: boolean; // hand-drawn wobble on strokes
};

export const THEMES: Record<string, MotionTheme> = {
  handnote: {
    name: 'handnote', bg: '#FBF7EE', ink: '#2B2A28', muted: '#7A746A', accent: '#E0533D',
    marker: 'rgba(255, 214, 92, 0.75)', line: '#2B2A28', surface: '#FFFFFF',
    font: '"Noto Sans SC", sans-serif', numFont: '"Noto Sans SC", sans-serif', radius: 18, stroke: 6, rough: true,
  },
  editorial: {
    name: 'editorial', bg: '#FFFFFF', ink: '#111111', muted: '#6B6B6B', accent: '#C8102E',
    marker: 'rgba(200, 16, 46, 0.14)', line: '#111111', surface: '#F5F5F2',
    font: '"Noto Serif CJK SC", "Noto Serif SC", serif', numFont: '"Noto Serif CJK SC", serif', radius: 4, stroke: 4, rough: false,
  },
  tech: {
    name: 'tech', bg: '#0B1020', ink: '#EAF0FF', muted: '#8A97B8', accent: '#3DE0C5',
    marker: 'rgba(61, 224, 197, 0.22)', line: '#3DE0C5', surface: '#141B33',
    font: '"Noto Sans SC", sans-serif', numFont: '"Noto Sans SC", sans-serif', radius: 14, stroke: 4, rough: false,
  },
};

export const ThemeContext = React.createContext<MotionTheme>(THEMES.handnote);
export const useTheme = () => React.useContext(ThemeContext);

/** Safe area for 1080x1920. Captions own the bottom band; main stage never enters it. */
export const SAFE = {width: 1080, height: 1920, side: 80, top: 140, captionTop: 1500, bottom: 140};
