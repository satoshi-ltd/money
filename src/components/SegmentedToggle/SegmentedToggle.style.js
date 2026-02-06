import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.xxs,
      padding: theme.spacing.xxs,
    },
    item: {
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
    },
    itemActive: {
      backgroundColor: colors.accent,
    },
  });

