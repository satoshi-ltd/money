import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    chip: {
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
    },
    chipWanted: {
      backgroundColor: colors.accentSoft,
    },
    chipPlain: {
      backgroundColor: colors.surface,
    },
  });
