import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  title: {
    marginBottom: '$viewOffset / 2',
  },

  slider: {
    marginBottom: '$spaceM',
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
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

  buttons: {
    gap: '$spaceM',
    marginTop: '$spaceL',
  },
});
