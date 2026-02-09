import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      flex: 1,
    },
    iconCard: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.6,
    },
    rightText: {
      textAlign: 'right',
    },
    switch: {
      transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
    },
  });
