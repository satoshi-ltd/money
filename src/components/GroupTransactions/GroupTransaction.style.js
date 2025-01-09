import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    marginBottom: '$viewOffset',
  },

  content: {
    paddingHorizontal: '$spaceM',
    paddingVertical: '$spaceS',
    width: '100%',
  },

  date: {
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
