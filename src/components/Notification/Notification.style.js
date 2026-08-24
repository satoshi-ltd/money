import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    notification: {
      borderBottomColor: colors.rule,
      borderBottomWidth: theme.hairline,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 999,
    },
    accent: {
      backgroundColor: colors.accent,
    },
    alert: {
      backgroundColor: colors.danger,
    },
    info: {
      backgroundColor: colors.inverse,
    },
    text: {
      flex: 1,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: viewOffset,
      paddingVertical: theme.spacing.sm,
    },
  });
