import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

const labelWidth = theme.spacing.xxl * 2 + theme.spacing.xs;

export const getStyles = (colors) =>
  StyleSheet.create({
    caption: {
      marginBottom: theme.spacing.md,
    },
    group: {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.xs,
    },
    row: {
      alignItems: 'center',
      height: rowHeight,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.xxs,
    },
    divider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    label: {
      width: labelWidth,
    },
    field: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      flex: 1,
      justifyContent: 'center',
      minHeight: rowHeight,
    },
    buttons: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
  });
