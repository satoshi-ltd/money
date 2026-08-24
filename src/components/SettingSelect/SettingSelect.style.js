import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      position: 'relative',
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minHeight: rowHeight,
    },
    divider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
  });
