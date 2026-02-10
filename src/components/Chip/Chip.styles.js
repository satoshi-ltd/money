import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xxs,
    },

    // Variants
    variantMuted: {
      backgroundColor: `${colors.textSecondary}20`,
    },
    variantAccent: {
      backgroundColor: colors.accent,
    },
    variantInverse: {
      backgroundColor: colors.inverse,
    },
    variantOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Sizes
    sizeXS: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
      minHeight: theme.spacing.lg,
    },
    sizeS: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      minHeight: theme.spacing.lg + theme.spacing.xxs,
    },

    // Shapes
    shapePill: {},
    shapeCircle: {
      paddingHorizontal: 0,
      width: theme.spacing.lg,
      minWidth: theme.spacing.lg,
      height: theme.spacing.lg,
      borderRadius: theme.borderRadius.full,
    },
  });

