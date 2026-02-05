import { StyleSheet } from 'react-native';

import { cardGap, viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  option: {
    marginLeft: cardGap,
  },

  firstOption: {
    marginLeft: viewOffset,
  },

  lastOption: {
    marginRight: viewOffset,
  },
});
