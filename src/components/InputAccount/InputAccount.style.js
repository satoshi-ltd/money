import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputTextHeight, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    list: {
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    select: {
      position: 'relative',
    },
    dropdownOption: {
      paddingVertical: viewOffset / 2,
      paddingHorizontal: theme.spacing.sm,
    },
    dropdownRow: {
      alignItems: 'center',
      width: '100%',
    },
    item: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      paddingVertical: viewOffset / 2,
      paddingHorizontal: theme.spacing.sm,
      minHeight: inputTextHeight,
      width: '100%',
    },
    first: {
      borderTopLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: theme.borderRadius.md,
    },
    last: {
      borderBottomLeftRadius: theme.borderRadius.md,
      borderBottomRightRadius: theme.borderRadius.md,
    },
    noBottom: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    focus: {
      borderColor: colors.accent,
    },
    iconCard: {
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.spacing.xl,
      width: theme.spacing.xl,
      marginRight: viewOffset / 2,
    },
    iconCardDropdown: {
      backgroundColor: colors.border,
    },
    textContainer: {
      justifyContent: 'center',
    },
    subline: {
      gap: theme.spacing.xxs,
    },
    rightPlaceholder: {
      width: theme.spacing.lg,
    },
  });
