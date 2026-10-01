import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { railWidth, rowHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    rail: {
      borderRightColor: colors.border,
      borderRightWidth: theme.hairline,
      gap: theme.spacing.xxs,
      paddingHorizontal: theme.spacing.sm,
      width: railWidth,
    },
    brand: {
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.md,
    },
    tab: {
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      minHeight: rowHeight - theme.spacing.xxs,
      paddingHorizontal: theme.spacing.xs,
    },
    tabOn: {
      backgroundColor: colors.surfaceSoft,
    },
    spacer: {
      flex: 1,
    },
  });
