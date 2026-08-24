import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { wellSize } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.none,
      padding: 0,
    },
    active: {
      backgroundColor: colors.accentSoft,
    },
    sizeS: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.sm,
      height: wellSize,
      justifyContent: 'center',
      padding: 0,
      width: wellSize,
    },
  });
