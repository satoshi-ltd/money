import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    children: {
      gap: viewOffset,
      marginTop: viewOffset,
      width: '100%',
    },
    container: {
      paddingHorizontal: viewOffset,
    },
    noPadding: {
      paddingHorizontal: 0,
    },
    heading: {
      marginHorizontal: 0,
      marginVertical: 0,
    },
    balanceRow: {
      alignItems: 'baseline',
      gap: theme.spacing.xxs,
    },
    progression: {
      gap: theme.spacing.xxs,
    },
    tags: {
      gap: theme.spacing.sm,
    },
    tag: {
      gap: theme.spacing.xxs,
    },
    incomeOverlay: {
      backgroundColor: colors.accent,
      position: 'absolute',
      borderRadius: theme.borderRadius.md,
      bottom: -theme.spacing.xxs,
      left: -theme.spacing.xxs,
      right: -theme.spacing.xxs,
      top: -theme.spacing.xxs,
      opacity: 0.15,
    },
  });
