import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  title: {
    marginBottom: viewOffset / 2,
  },

  buttons: {
    gap: viewOffset,
    marginTop: theme.spacing.lg,
  },
});
