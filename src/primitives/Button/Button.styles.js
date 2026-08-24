import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { buttonHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'center',
      minHeight: buttonHeight,
      paddingHorizontal: theme.spacing.md,
    },
    grow: { flex: 1 },
    small: {
      minHeight: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
    },
    large: {
      minHeight: buttonHeight,
    },
    iconOnly: {
      height: theme.spacing.xl + 2,
      minHeight: theme.spacing.xl + 2,
      minWidth: theme.spacing.xl + 2,
      paddingHorizontal: 0,
      width: theme.spacing.xl + 2,
    },
    iconOnlySmall: {
      height: theme.spacing.lg + theme.spacing.xs,
      minHeight: theme.spacing.lg + theme.spacing.xs,
      minWidth: theme.spacing.lg + theme.spacing.xs,
      width: theme.spacing.lg + theme.spacing.xs,
    },
    iconOnlyLarge: {
      height: theme.spacing.xxl - 2,
      minHeight: theme.spacing.xxl - 2,
      minWidth: theme.spacing.xxl - 2,
      width: theme.spacing.xxl - 2,
    },

    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.inverse },
    ghost: { backgroundColor: 'transparent' },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderWidth: theme.hairline,
    },
    danger: { backgroundColor: colors.danger },
    dangerSoft: {
      backgroundColor: 'transparent',
      borderColor: colors.danger,
      borderWidth: theme.hairline,
    },

    disabledPrimary: { backgroundColor: colors.surfaceSoft },
    disabledSecondary: { backgroundColor: colors.surfaceSoft },
    disabledOutlined: { borderColor: colors.border },
    disabledGhost: { backgroundColor: 'transparent' },
    disabled: { opacity: 0.55 },
  });
