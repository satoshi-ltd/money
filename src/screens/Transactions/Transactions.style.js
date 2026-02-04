import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingTop: 0,
  },

  buttons: {
    backgroundColor: '$colorSurface',
    borderRadius: '$borderRadius * 2',
    gap: '$spaceXXS',
    marginTop: '$spaceS',
    marginBottom: '$spaceS',
    padding: '$spaceXXS',
  },
  headerWrap: {
    paddingHorizontal: '$viewOffset',
    paddingTop: '$spaceM',
  },

  inputSearch: {
    marginHorizontal: 0,
    marginBottom: '$viewOffset',
  },
});
