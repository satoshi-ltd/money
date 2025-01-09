import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  bar: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    maxHeight: '$spaceXXL + $spaceS',
    height: '100%',
    position: 'absolute',
    top: 0,
    minWidth: '$spaceXXL + $spaceS',
  },

  highlight: {
    backgroundColor: '$colorAccent',
  },

  content: {
    paddingLeft: '$spaceXS',
    height: '$spaceXXL + $spaceS',
  },

  detail: {
    height: 'auto',
    marginLeft: '$spaceXXL + $viewOffset',
    marginVertical: '$spaceXXS',
  },

  cardIcon: {
    height: '$spaceXXL',
    marginRight: '$spaceS + $spaceXS',
    width: '$spaceXXL',
  },

  amount: {
    top: '$spaceXXS * -1',
  },
});
