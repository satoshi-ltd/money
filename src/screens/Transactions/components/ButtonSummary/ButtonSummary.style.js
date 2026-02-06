import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      flex: 1,
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      width: '100%',
    },
    iconWrap: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: theme.borderRadius.full,
      height: theme.spacing.xl,
      justifyContent: 'center',
      width: theme.spacing.xl,
    },
  });
