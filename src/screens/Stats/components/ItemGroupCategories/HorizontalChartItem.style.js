import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  bar: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    maxHeight: '$spaceXXL + $spaceXS',
    height: '100%',
    position: 'absolute',
    top: 0,
    minWidth: '$spaceXXL + $spaceXS',
  },

  highlight: {
    backgroundColor: '$colorAccent',
  },

  content: {
    paddingLeft: '$spaceXXS',
    height: '$spaceXXL + $spaceXS',
  },

  detail: {
    height: 'auto',
    marginLeft: '$spaceXXL + $spaceS',
    marginVertical: '$spaceXXS',
  },

  cardIcon: {
    height: '$spaceXXL',
    marginRight: '$spaceS',
    width: '$spaceXXL',
  },

  amount: {
    top: '$spaceXXS * -1',
  },
});
