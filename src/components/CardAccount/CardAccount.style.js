import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { cardAccountSize } from '../../theme/layout';

const style = StyleSheet.create({
  card: {
    height: cardAccountSize,
    width: cardAccountSize,
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },

  color: {
    borderRadius: 9999,
    height: theme.typography.sizes.tiny,
    marginRight: theme.spacing.xs,
    width: theme.typography.sizes.tiny,
  },

  chart: {
    bottom: theme.spacing.xxs,
    left: theme.spacing.sm * -1,
    position: 'absolute',
    zIndex: 0,
  },
  percentage: {},
});

export { style };
