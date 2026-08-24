import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { fieldHeight, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      paddingTop: 0,
    },

    balance: {
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm,
      paddingHorizontal: viewOffset,
    },
    balanceRow: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },

    flow: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
      marginHorizontal: viewOffset,
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    monthLabel: {
      marginBottom: theme.spacing.xs,
    },
    flowRows: {
      gap: theme.spacing.xs + 2,
    },
    flowRow: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    flowLabel: {
      width: theme.spacing.xxl + theme.spacing.md,
    },
    flowBar: {
      backgroundColor: colors.surface,
      flex: 1,
      height: 5,
      overflow: 'hidden',
    },
    flowFillIncome: {
      backgroundColor: colors.accent,
      height: '100%',
    },
    flowFillExpense: {
      backgroundColor: colors.text,
      height: '100%',
    },
    flowValue: {
      alignItems: 'flex-end',
      minWidth: theme.spacing.xxl + theme.spacing.xl,
    },

    actions: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
      paddingHorizontal: viewOffset,
    },

    search: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: theme.hairline,
      gap: theme.spacing.xs,
      height: fieldHeight,
      marginBottom: theme.spacing.xs,
      marginHorizontal: viewOffset,
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontFamily: theme.typography.fontFaces.regular,
      fontSize: theme.typography.sizes.body,
      minHeight: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
  });
