import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const chipHeight = { s: theme.spacing.xl, xs: theme.spacing.lg + theme.spacing.xxs };

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
      flexDirection: 'row',
      gap: theme.spacing.xxs + 2,
      justifyContent: 'center',
    },

    variantMuted: { backgroundColor: colors.surface },
    variantSoft: { backgroundColor: colors.accentSoft },
    variantAccent: { backgroundColor: colors.accent },
    variantInverse: { backgroundColor: colors.text },
    variantOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderWidth: theme.hairline,
    },

    sizeXS: {
      minHeight: chipHeight.xs,
      paddingHorizontal: theme.spacing.xs + 2,
      paddingVertical: theme.spacing.xxs + 3,
    },
    sizeS: {
      minHeight: chipHeight.s,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },

    label: {
      fontSize: theme.typography.sizes.tiny,
      lineHeight: theme.typography.sizes.tiny + 2,
    },

    shapePill: {},
    shapeCircle: {
      borderRadius: theme.borderRadius.full,
      height: theme.spacing.lg + theme.spacing.xxs,
      minWidth: theme.spacing.lg + theme.spacing.xxs,
      paddingHorizontal: 0,
      width: theme.spacing.lg + theme.spacing.xxs,
    },
  });
