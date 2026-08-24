import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: theme.hairline,
      overflow: 'hidden',
    },
    scroll: {
      flexGrow: 0,
    },
    item: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xs + 1,
    },
    itemFlex: {
      flex: 1,
    },
    // Hugs its labels instead of spanning the screen, at the same height as a small Button beside it.
    containerCompact: {
      alignSelf: 'flex-start',
    },
    itemCompact: {
      justifyContent: 'center',
      minHeight: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 0,
    },
    itemAuto: {
      paddingHorizontal: theme.spacing.md,
    },
    itemDivider: {
      borderLeftColor: colors.border,
      borderLeftWidth: theme.hairline,
    },
    itemActive: {
      backgroundColor: colors.inverse,
    },
  });
