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
    line: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
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
      borderBottomColor: colors.border,
      borderBottomWidth: theme.hairline,
      paddingVertical: theme.spacing.xs - 1,
    },
    key: {
      width: theme.spacing.xxl * 2 + theme.spacing.xs,
    },
    value: {
      flexGrow: 1,
      flexShrink: 0,
    },
    context: {
      alignItems: 'baseline',
      flexShrink: 1,
    },
    // The name gives way eight times faster than the direction and never below a stub: the sign already says which way.
    hint: {
      flexShrink: 8,
      minWidth: theme.spacing.xl,
    },
    detail: {
      flexShrink: 1,
    },
    action: {
      alignItems: 'center',
      gap: theme.spacing.xxs,
    },
    contextRow: {
      flex: 1,
      gap: theme.spacing.xxs,
      justifyContent: 'flex-end',
    },
  });
