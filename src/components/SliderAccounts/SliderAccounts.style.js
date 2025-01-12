import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollview: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
  },

  option: {
    marginLeft: '$cardGap',
  },

  firstOption: {
    marginLeft: '$viewOffset',
  },

  lastOption: {
    marginRight: '$viewOffset',
  },
});
