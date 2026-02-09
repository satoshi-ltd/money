import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { cardAccountSize } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      height: cardAccountSize,
      width: cardAccountSize,
    },
    content: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
      zIndex: 1,
    },

    color: {
      borderRadius: 9999,
      height: theme.typography.sizes.tiny,
      marginRight: theme.spacing.xs,
      width: theme.typography.sizes.tiny,
    },

    chart: {
      bottom: theme.spacing.xxs,
      left: theme.spacing.sm * -1,
      position: 'absolute',
      zIndex: 0,
    },

    // Text halo so the % label doesn't visually collide with the chart line.
    percentage: {
      alignSelf: 'flex-start',
      textShadowColor: colors.surface,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 2,
    },
    percentageOnAccent: {
      textShadowColor: colors.accent,
    },
  });
