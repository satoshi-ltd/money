import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';
import { viewOffset } from '../../../../theme/layout';

export const getStyles = () =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.md,
      paddingHorizontal: viewOffset,
    },
    showLess: {
      paddingVertical: theme.spacing.sm,
    },
    showLessLabel: {
      textAlign: 'center',
    },
  });
