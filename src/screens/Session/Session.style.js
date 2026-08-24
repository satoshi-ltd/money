import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const DOT_SIZE = 14;
const DOT_GAP = 18;

export const getStyles = (colors) =>
  StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.md,
    },
    spacerTop: {
      flex: 1.2,
    },
    spacerMiddle: {
      flex: 1,
    },
    caption: {
      marginTop: theme.spacing.xxs * -1,
    },
    version: {
      marginTop: theme.spacing.xs,
    },

    pinCode: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },

    pin: {
      backgroundColor: 'transparent',
      borderColor: colors.textMuted,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1.5,
      height: DOT_SIZE,
      marginHorizontal: DOT_GAP / 2,
      width: DOT_SIZE,
    },

    pinActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
  });
