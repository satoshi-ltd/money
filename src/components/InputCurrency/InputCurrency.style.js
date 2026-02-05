import { Platform, StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputTextHeight, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      height: inputTextHeight,
      paddingLeft: inputPaddingHorizontal,
      paddingRight: inputPaddingHorizontal,
    },
    rowContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      flex: 1,
    },
    selectedValue: {
      fontSize: theme.typography.sizes.body,
    },
    iconCard: {
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.spacing.xl,
      width: theme.spacing.xl,
    },
    iconCardDropdown: {
      backgroundColor: colors.border,
    },
    option: {
      paddingVertical: viewOffset / 2,
      paddingHorizontal: theme.spacing.sm,
    },
    optionRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      width: '100%',
    },
    optionTextContainer: {
      justifyContent: 'center',
    },
    optionTextWeb: {
      ...Platform.select({ web: { outlineWidth: 0 } }),
    },
  });
