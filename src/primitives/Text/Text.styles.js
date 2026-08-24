import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const { figureLineHeights, figureSizes, fontFaces, lineHeights, sizes, tracking } = theme.typography;

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      fontSize: sizes.body,
      lineHeight: lineHeights.body,
      fontFamily: fontFaces.regular,
      color: colors.text,
    },
    medium: {
      fontFamily: fontFaces.medium,
    },
    bold: {
      fontFamily: fontFaces.bold,
    },

    title: {
      fontSize: sizes.title,
      lineHeight: lineHeights.title,
      letterSpacing: tracking.title,
    },
    heading: {
      fontSize: sizes.heading,
      lineHeight: lineHeights.heading,
      letterSpacing: -0.22,
    },
    subtitle: {
      fontSize: sizes.subtitle,
      lineHeight: lineHeights.subtitle,
    },
    body: {
      fontSize: sizes.body,
      lineHeight: lineHeights.body,
    },
    caption: {
      fontSize: sizes.caption,
      lineHeight: lineHeights.caption,
    },
    tiny: {
      fontSize: sizes.tiny,
      lineHeight: lineHeights.tiny,
    },
    micro: {
      fontSize: sizes.micro,
      lineHeight: lineHeights.micro,
    },

    mono: {
      fontFamily: fontFaces.mono,
      fontVariant: ['tabular-nums'],
      letterSpacing: tracking.figure,
    },
    monoMedium: {
      fontFamily: fontFaces.monoMedium,
    },
    figureXs: { fontSize: figureSizes.xs, lineHeight: figureLineHeights.xs, letterSpacing: 0 },
    figureSm: { fontSize: figureSizes.sm, lineHeight: figureLineHeights.sm },
    figureMd: { fontSize: figureSizes.md, lineHeight: figureLineHeights.md },
    figureLg: { fontSize: figureSizes.lg, lineHeight: figureLineHeights.lg },
    figureXl: { fontSize: figureSizes.xl, lineHeight: figureLineHeights.xl },
    figureHero: { fontSize: figureSizes.hero, lineHeight: figureLineHeights.hero, letterSpacing: -1.4 },

    tonePrimary: { color: colors.text },
    toneSecondary: { color: colors.textSecondary },
    toneMuted: { color: colors.textMuted },
    tonePositive: { color: colors.positive },
    toneAccent: { color: colors.accent },
    toneDanger: { color: colors.danger },
    toneWarning: { color: colors.warning },
    toneOnAccent: { color: colors.onAccent },
    toneOnAccentSoft: { color: colors.onAccentSoft },
    toneOnInverse: { color: colors.onInverse },

    alignLeft: { textAlign: 'left' },
    alignCenter: { textAlign: 'center' },
    alignRight: { textAlign: 'right' },
    flex: { flex: 1 },
    uppercase: {
      textTransform: 'uppercase',
      letterSpacing: tracking.eyebrow,
    },
  });
