import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { GLYPHS } from './glyphs';
import { useApp } from '../../contexts';
import { theme } from '../../theme';

const SIZES = { xl: 'title', l: 'subtitle', m: 'body', s: 'caption', xs: 'tiny', xxs: 'xxs' };
const TONES = {
  secondary: 'textSecondary',
  muted: 'textSecondary',
  accent: 'accent',
  positive: 'positive',
  danger: 'danger',
  warning: 'warning',
  onAccent: 'onAccent',
  onAccentSoft: 'onAccentSoft',
  onInverse: 'onInverse',
};
const STROKE = 1.5;

const Icon = ({ name, size, style, tone, ...props }) => {
  const { colors } = useApp();

  const glyph = GLYPHS[name];
  if (!glyph) return null;

  const resolved = typeof size === 'number' ? size : theme.typography.iconSizes[SIZES[size] || 'body'];

  return (
    <Svg
      {...props}
      fill="none"
      height={resolved}
      stroke={colors[TONES[tone]] || colors.text}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={STROKE}
      style={style}
      viewBox="0 0 24 24"
      width={resolved}
    >
      {glyph.map((d) => (
        <Path d={d} key={d} />
      ))}
    </Svg>
  );
};

export default Icon;
