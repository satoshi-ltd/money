import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    box: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: theme.hairline,
      height: theme.spacing.lg,
      justifyContent: 'center',
      width: theme.spacing.lg,
    },
    checked: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
  });
