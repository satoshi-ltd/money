import { StyleSheet } from 'react-native';

import { cardGap, viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  scrollview: {
    marginLeft: viewOffset * -1,
    marginRight: viewOffset * -1,
  },

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
