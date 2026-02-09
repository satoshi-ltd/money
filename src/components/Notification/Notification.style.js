import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    notification: {
      position: 'absolute',
      top: 0,
      left: viewOffset,
      right: viewOffset,
      zIndex: 999,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      ...theme.shadows.md,
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
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      width: 'auto',
    },
  });
