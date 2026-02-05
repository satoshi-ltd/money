import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    bar: {
      backgroundColor: colors.border,
      borderRadius: theme.borderRadius.md,
      height: '100%',
      maxHeight: theme.spacing.lg,
      minWidth: theme.spacing.lg,
      position: 'absolute',
      left: 0,
      top: 0,
    },

    content: {
      gap: theme.spacing.sm,
      paddingLeft: theme.spacing.xxs,
      paddingVertical: theme.spacing.xxs,
    },

    detail: {
      paddingBottom: 0,
      paddingLeft: theme.spacing.md,
    },
  });
