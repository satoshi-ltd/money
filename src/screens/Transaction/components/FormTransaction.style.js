import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
    marginBottom: '$viewOffset',
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
