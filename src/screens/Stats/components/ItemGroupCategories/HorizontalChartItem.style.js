import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.xs + 2,
      paddingVertical: theme.spacing.xs - 1,
    },
    dot: {
      borderRadius: theme.borderRadius.full,
      height: 7,
      width: 7,
    },
    track: {
      height: 5,
      overflow: 'hidden',
      width: theme.spacing.xxl + theme.spacing.md,
    },
    fill: {
      height: '100%',
    },
    percent: {
      width: theme.spacing.xl,
    },
    amount: {
      alignItems: 'flex-end',
      minWidth: theme.spacing.xxl + theme.spacing.md,
    },
  });
