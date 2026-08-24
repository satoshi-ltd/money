import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputTextHeight, wellSize } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      height: inputTextHeight,
      paddingHorizontal: inputPaddingHorizontal,
    },
    rowContent: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
    },
    well: {
      alignItems: 'center',
      backgroundColor: colors.surfaceSoft,
      borderRadius: theme.borderRadius.sm,
      height: wellSize,
      justifyContent: 'center',
      width: wellSize,
    },
  });
