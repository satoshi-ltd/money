import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'flex-end',
    },

    content: {
      alignItems: 'center',
      gap: viewOffset,
    },

    pinCode: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },

    pin: {
      backgroundColor: colors.border,
      borderRadius: theme.spacing.md / 2,
      height: theme.spacing.md,
      marginHorizontal: theme.spacing.sm,
      width: theme.spacing.md,
    },

    pinActive: {
      backgroundColor: colors.accent,
    },
  });
