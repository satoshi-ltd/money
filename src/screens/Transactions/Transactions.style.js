import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      paddingTop: 0,
    },

    buttons: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.md * 2,
      gap: theme.spacing.xxs,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.xxs,
    },
    headerWrap: {
      paddingHorizontal: viewOffset,
      paddingTop: theme.spacing.sm,
    },
    insightsTop: {
      paddingTop: theme.spacing.md,
    },

    inputSearch: {
      marginHorizontal: 0,
      marginBottom: viewOffset,
    },
  });
