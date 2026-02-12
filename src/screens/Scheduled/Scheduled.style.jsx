import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    content: {
      paddingBottom: theme.spacing.sm,
    },
    topCta: {
      marginBottom: theme.spacing.sm,
    },
    section: {
      marginBottom: theme.spacing.xs,
    },
    sectionTitle: {
      marginVertical: theme.spacing.xxs,
    },
    item: {
      marginBottom: theme.spacing.xs,
    },
    row: {
      alignItems: 'flex-start',
      backgroundColor: colors.background,
      gap: theme.spacing.xs,
      paddingHorizontal: 0,
      paddingVertical: theme.spacing.xxs,
    },
    right: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
    },
    emptyCard: {
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.sm,
    },
    emptyHeader: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
