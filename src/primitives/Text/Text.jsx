import React, { useMemo } from 'react';
import { Text as RNText } from 'react-native';

import { getStyles } from './Text.styles';
import { useApp } from '../../contexts';

const SIZES = { xxl: 'title', xl: 'heading', l: 'subtitle', m: 'body', s: 'caption', xs: 'tiny', xxs: 'micro' };
const FIGURES = { hero: 'figureHero', xl: 'figureXl', lg: 'figureLg', md: 'figureMd', sm: 'figureSm', xs: 'figureXs' };
const TONES = {
  secondary: 'toneSecondary',
  muted: 'toneMuted',
  positive: 'tonePositive',
  accent: 'toneAccent',
  danger: 'toneDanger',
  warning: 'toneWarning',
  onAccent: 'toneOnAccent',
  onAccentSoft: 'toneOnAccentSoft',
  onInverse: 'toneOnInverse',
};

const Text = ({ align, bold, figure, flex, medium, mono, size, style, tone, uppercase, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isMono = mono || figure !== undefined;
  const weightStyle = bold ? styles.bold : medium ? styles.medium : null;

  return (
    <RNText
      {...props}
      style={[
        styles.base,
        SIZES[size] ? styles[SIZES[size]] : null,
        isMono ? styles.mono : null,
        isMono && (bold || medium) ? styles.monoMedium : null,
        !isMono ? weightStyle : null,
        FIGURES[figure] ? styles[FIGURES[figure]] : null,
        styles[TONES[tone]] || styles.tonePrimary,
        align === 'center' ? styles.alignCenter : align === 'right' ? styles.alignRight : align ? styles.alignLeft : null,
        flex ? styles.flex : null,
        uppercase ? styles.uppercase : null,
        style,
      ]}
    />
  );
};

export default Text;
