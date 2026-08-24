import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const WHEN_WIDTH = theme.spacing.xxl + theme.spacing.xxs;

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
    content: {
      paddingBottom: theme.spacing.md,
    },

    summary: {
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm + 2,
      paddingBottom: theme.spacing.md,
    },

    section: {
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs,
    },

    row: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs + 2,
    },
    when: {
      gap: 1,
      width: WHEN_WIDTH,
    },
    text: {
      gap: 1,
    },
    amount: {
      alignItems: 'flex-end',
      gap: 1,
    },

    empty: {
      gap: theme.spacing.xxs,
      paddingTop: theme.spacing.xl,
    },

  });
