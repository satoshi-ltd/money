import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';
import { viewOffset } from '../../../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    // Far enough below the last setting that nobody meets it without meaning to.
    container: {
      alignItems: 'center',
      marginTop: theme.spacing.xxl * 2,
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: viewOffset,
    },
    version: {
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    rule: {
      backgroundColor: colors.border,
      height: theme.hairline,
      marginBottom: theme.spacing.xl,
      width: 48,
    },
    maker: {
      marginBottom: theme.spacing.md,
    },
    caption: {
      marginTop: theme.spacing.sm,
      maxWidth: 300,
    },
    who: {
      marginTop: theme.spacing.xs,
      maxWidth: 300,
    },
    vitals: {
      marginTop: theme.spacing.lg,
    },
    mail: {
      marginTop: theme.spacing.lg,
    },
  });
