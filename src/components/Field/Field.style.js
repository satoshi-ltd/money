import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputPaddingVertical, inputTextHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      borderColor: colors.border,
      borderWidth: 1,
      minHeight: inputTextHeight,
    },
    noBottom: {
      borderBottomWidth: 0,
    },
    first: {
      borderTopLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: theme.borderRadius.md,
    },
    last: {
      borderBottomLeftRadius: theme.borderRadius.md,
      borderBottomRightRadius: theme.borderRadius.md,
    },
    focus: {
      borderColor: colors.accent,
    },
    label: {
      position: 'absolute',
      left: inputPaddingHorizontal,
      top: inputPaddingVertical - theme.spacing.xxs,
      zIndex: 1,
    },
    content: {
      alignItems: 'stretch',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    inputSlot: {
      minHeight: inputTextHeight,
    },
    suffix: {
      justifyContent: 'center',
      paddingRight: inputPaddingHorizontal,
    },
  });
