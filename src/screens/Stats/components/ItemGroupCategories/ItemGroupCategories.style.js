import { StyleSheet } from 'react-native';

import { viewOffset } from '../../../../theme/layout';

export const style = StyleSheet.create({
  container: {
    marginBottom: viewOffset,
  },

  content: {
    gap: viewOffset / 2,
    marginHorizontal: viewOffset,
  },

  touchable: {
    width: '100%',
  },
});
