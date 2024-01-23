import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  slider: {
    marginBottom: '$spaceL',
    paddingRight: '$spaceM',
  },

  card: {
    marginLeft: '$spaceS',
  },

  firstCard: {
    marginLeft: '$spaceM',
  },

  item: {
    paddingHorizontal: '$spaceM',
    paddingVertical: '$spaceS',
    width: '100%',
  },

  itemDisabled: {
    opacity: 0.5,
  },

  cardCurrency: {
    height: '$spaceXXL + $spaceXS',
    marginRight: '$spaceS',
    width: '$spaceXXL + $spaceXS',
  },
});
