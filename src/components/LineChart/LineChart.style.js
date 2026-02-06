import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      opacity: 1,
      overflow: 'hidden',
    },
    pointerCaption: {
      marginBottom: theme.spacing.xxs,
    },
    pointerValue: {
      paddingHorizontal: theme.spacing.xxs,
      paddingVertical: theme.spacing.xxs / 2,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: colors.inverse,
    },
  });
