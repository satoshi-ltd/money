import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  content: {
    paddingHorizontal: '$spaceM',
    paddingVertical: '$spaceS',
    width: '100%',
  },

  date: {
    marginTop: '$spaceXS',
    marginLeft: '$viewOffset',
  },

  cardIcon: {
    height: '$spaceXXL + $spaceS',
    width: '$spaceXXL + $spaceS',
    marginRight: '$spaceS',
  },
});
