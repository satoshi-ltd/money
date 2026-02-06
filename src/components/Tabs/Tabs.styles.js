import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xxs,
    },
    tab: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    active: {
      backgroundColor: colors.accent,
    },
    activeAlt: {
      backgroundColor: colors.inverse,
    },
  });
