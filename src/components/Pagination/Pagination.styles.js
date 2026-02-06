import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    dot: {
      width: theme.spacing.xs,
      height: theme.spacing.xs,
      borderRadius: theme.spacing.xs,
      backgroundColor: colors.border,
    },
    active: {
      backgroundColor: colors.accent,
    },
  });
