import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    item: {
      marginBottom: theme.spacing.xs,
    },
    row: {
      alignItems: 'center',
      backgroundColor: colors.background,
      gap: theme.spacing.xs,
      paddingHorizontal: 0,
      paddingVertical: theme.spacing.xxs,
    },
    right: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
    },
    createButton: {
      marginTop: theme.spacing.sm,
    },
  });
