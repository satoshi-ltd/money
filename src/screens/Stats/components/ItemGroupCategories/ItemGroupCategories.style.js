import { StyleSheet } from 'react-native';

import { viewOffset } from '../../../../theme/layout';
import { theme } from '../../../../theme';

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
