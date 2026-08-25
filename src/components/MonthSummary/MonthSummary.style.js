import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.xxs,
    },
    lead: {
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      paddingBottom: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
    },
    leadHead: {
      alignItems: 'baseline',
    },
    track: {
      backgroundColor: colors.surface,
      height: 5,
      marginBottom: theme.spacing.xs - 2,
      marginTop: theme.spacing.xs + 1,
      position: 'relative',
    },
    fill: {
      backgroundColor: colors.accent,
      height: '100%',
    },
    excess: {
      backgroundColor: colors.text,
      height: '100%',
    },
    tick: {
      backgroundColor: colors.text,
      height: 11,
      position: 'absolute',
      top: -3,
      width: 1,
    },
    usual: {
      alignItems: 'baseline',
    },
    row: {
      alignItems: 'baseline',
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs - 1,
    },
    key: {
      width: theme.spacing.xxl * 2 + theme.spacing.xs,
    },
    context: {
      flex: 1,
    },
    contextRow: {
      flex: 1,
      gap: theme.spacing.xxs,
      justifyContent: 'flex-end',
    },
  });
