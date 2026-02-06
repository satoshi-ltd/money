import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    notification: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      width: '100%',
    },
    accent: {
      backgroundColor: colors.accent,
    },
    alert: {
      backgroundColor: colors.danger,
    },
    info: {
      backgroundColor: colors.inverse,
    },
    text: {
      flex: 1,
    },
    safeAreaView: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginHorizontal: viewOffset,
      marginVertical: viewOffset / 2,
      width: 'auto',
    },
  });
