import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  content: {
    paddingHorizontal: '$viewOffset',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },

  headerContainer: {
    backgroundColor: '$colorBase',
  },

  date: {
    marginTop: '$viewOffset / 2',
    marginLeft: '$viewOffset',
  },

  text: {
    flex: 1,
  },

  cardIcon: {
    height: '$spaceXXL + $spaceS',
    width: '$spaceXXL + $spaceS',
    marginRight: '$viewOffset / 2',
  },
});
