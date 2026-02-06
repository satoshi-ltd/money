import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      overflow: 'hidden',
    },
    active: {
      backgroundColor: colors.accent,
    },
    sizeS: {
      height: theme.spacing.xl + theme.spacing.xs,
      width: theme.spacing.xl + theme.spacing.xs,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
