import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';
import { viewOffset } from '../../../../theme/layout';

export const style = StyleSheet.create({
  container: {
    marginBottom: viewOffset * 0.75,
  },

  content: {
    gap: viewOffset / 4,
    marginHorizontal: viewOffset,
  },

  touchable: {
    width: '100%',
  },

  detailGroup: {
    gap: theme.spacing.xxs,
  },
});
