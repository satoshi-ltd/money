import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  title: {
    marginBottom: '$viewOffset / 2',
  },

  slider: {
    marginLeft: '$viewOffset * -1',
    marginRight: '$viewOffset * -1',
  },

  buttons: {
    gap: '$viewOffset',
    marginTop: '$spaceL',
  },
});
