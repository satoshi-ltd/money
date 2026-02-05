import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputPaddingVertical, inputTextHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      color: colors.text,
      fontFamily: 'font-bold',
      fontSize: 16,
      paddingHorizontal: inputPaddingHorizontal,
      paddingVertical: inputPaddingVertical,
      minHeight: inputTextHeight,
    },
    grow: {
      flex: 1,
    },
    multiline: {
      textAlignVertical: 'top',
      // Keep the same horizontal padding; allow the container to decide height.
      paddingTop: inputPaddingVertical,
    },
    placeholderColor: {
      color: colors.textSecondary,
    },
  });
