import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
      minHeight: rowHeight,
    },
    divider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    label: {
      width: theme.spacing.xxl * 2,
    },
    value: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.xs,
      justifyContent: 'flex-end',
    },
  });
