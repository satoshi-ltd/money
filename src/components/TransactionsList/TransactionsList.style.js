import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    headerContainer: {
      alignItems: 'baseline',
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: viewOffset,
      marginTop: theme.spacing.sm + 2,
      paddingBottom: theme.spacing.xs - 2,
    },

    row: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.sm,
      marginHorizontal: viewOffset,
      paddingVertical: theme.spacing.xs + 2,
    },
    time: {
      width: theme.spacing.xl + 2,
    },
    text: {
      gap: 1,
    },
    amount: {
      alignItems: 'flex-end',
      gap: 1,
    },

    swipeActions: {
      flexDirection: 'row',
    },
    swipeAction: {
      alignItems: 'center',
      justifyContent: 'center',
      width: theme.spacing.xxl + theme.spacing.xl,
    },
  });
