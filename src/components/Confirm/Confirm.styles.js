import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

const scrimMargin = theme.spacing.xl - theme.spacing.xxs;
const wellSize = theme.spacing.xxl - theme.spacing.xxs;

export const getStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      alignItems: 'center',
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: scrimMargin,
    },
    dialog: {
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: colors.background,
      borderColor: colors.rule,
      borderRadius: theme.borderRadius.none,
      borderWidth: theme.hairline,
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg + theme.spacing.xxs,
    },
    well: {
      alignItems: 'center',
      backgroundColor: colors.dangerSoft,
      borderRadius: theme.borderRadius.sm,
      height: wellSize,
      justifyContent: 'center',
      width: wellSize,
    },
    actions: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
  });
