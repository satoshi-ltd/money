import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      justifyContent: 'center',
      minHeight: rowHeight,
    },
    divider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flex: 1,
    },
    disabled: {
      opacity: 0.6,
    },
    rightText: {
      textAlign: 'right',
    },
    switch: {
      transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
  });
