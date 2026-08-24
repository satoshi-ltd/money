import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    hero: {
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm + 2,
      paddingHorizontal: viewOffset,
    },
    heroValue: {
      marginTop: theme.spacing.xxs,
    },
    heroMeta: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
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
      paddingVertical: theme.spacing.xs + 2,
    },
    accountText: {
      gap: 2,
    },
    accountRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    inputSearch: {
      marginHorizontal: viewOffset,
      marginTop: theme.spacing.xs,
    },
  });

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
  },
});
