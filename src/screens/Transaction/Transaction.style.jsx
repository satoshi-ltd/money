import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  footer: {
    gap: viewOffset,
    marginTop: theme.spacing.sm,
  },
});
