import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      paddingBottom: theme.spacing.xxl * 2,
    },
    empty: {
      flexGrow: 1,
      paddingBottom: 0,
    },

    hero: {
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm + 2,
      paddingHorizontal: viewOffset,
    },
    heroValue: {
      marginTop: theme.spacing.xxs,
    },

    distribution: {
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      paddingHorizontal: viewOffset,
    },
    bar: {
      borderRadius: theme.borderRadius.none,
      height: 10,
      overflow: 'hidden',
    },
    legend: {
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    legendItem: {
      alignItems: 'center',
      gap: theme.spacing.xxs + 2,
    },
    dot: {
      borderRadius: theme.borderRadius.full,
      height: 7,
      width: 7,
    },

    toolbar: {
      marginTop: theme.spacing.md,
      paddingHorizontal: viewOffset,
    },

    section: {
      marginTop: theme.spacing.md,
      paddingHorizontal: viewOffset,
    },
    accountRow: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.sm,
      minHeight: rowHeight + theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    accountText: {
      gap: 2,
    },
    accountMeta: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
    },
    accountRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    totalRow: {
      alignItems: 'center',
      borderTopColor: colors.rule,
      borderTopWidth: theme.hairline,
      marginTop: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
    },
  });
