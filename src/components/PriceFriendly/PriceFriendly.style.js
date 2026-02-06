import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xxs,
  },
  symbol: {
    transform: [{ scale: 0.9 }],
  },
});
