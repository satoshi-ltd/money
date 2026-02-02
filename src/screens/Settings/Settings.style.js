import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$viewOffset',
  },

  hint: {
    marginTop: '$spaceXS',
  },

  offset: {
    marginHorizontal: '$viewOffset',
    width: 'auto',
  },
});
