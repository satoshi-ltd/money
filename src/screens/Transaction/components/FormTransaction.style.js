import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
    marginBottom: '$spaceM',
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

  inputCurrency: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  inputTitle: {
    marginTop: '$borderWidth * -1',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
