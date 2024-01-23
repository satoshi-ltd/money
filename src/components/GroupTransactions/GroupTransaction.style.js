import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  content: {
    paddingHorizontal: '$spaceM',
    paddingVertical: '$spaceS',
    width: '100%',
  },

  cardDate: {
    alignItems: 'center',
    height: '$spaceXXL + $spaceXS',
    justifyContent: 'center',
    marginBottom: '$spaceXS',
    marginHorizontal: '$spaceM',
    marginTop: '$spaceS',
    padding: 0,
    width: '$spaceXXL + $spaceXS',
  },

  cardIcon: {
    height: '$spaceXXL + $spaceXS',
    marginRight: '$spaceS',
    width: '$spaceXXL + $spaceXS',
  },
});
