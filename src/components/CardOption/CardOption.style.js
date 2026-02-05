import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { optionSize } from '../../theme/layout';

const style = StyleSheet.create({
  card: {
    padding: 0,
    height: optionSize,
    gap: theme.spacing.xxs,
    width: optionSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { style };
