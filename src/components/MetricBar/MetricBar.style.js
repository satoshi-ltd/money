import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xxs,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    track: {
      height: theme.spacing.xxs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
    },
    segments: {
      width: '100%',
      height: '100%',
      alignItems: 'stretch',
    },
  });
