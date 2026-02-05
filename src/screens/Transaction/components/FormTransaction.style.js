import { StyleSheet } from 'react-native';

import { cardGap, viewOffset } from '../../../theme/layout';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: viewOffset * -1,
    marginRight: viewOffset * -1,
    marginBottom: viewOffset,
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
