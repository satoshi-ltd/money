import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      paddingBottom: theme.spacing.xxl * 3,
    },

    backup: {
      alignItems: 'center',
      backgroundColor: colors.accentSoft,
      borderRadius: theme.borderRadius.none,
      gap: theme.spacing.sm,
      paddingHorizontal: viewOffset,
      paddingVertical: theme.spacing.md - 2,
    },
    backupCaption: {
      opacity: 0.75,
    },

    group: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: viewOffset,
    },
    groupLabel: {
      marginBottom: theme.spacing.xxs,
    },

    version: {
      marginTop: theme.spacing.xl,
      paddingHorizontal: viewOffset,
    },
  });
