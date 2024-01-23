import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginBottom: '$spaceL',
  },

  card: {
    marginLeft: '$cardGap',
  },

  firstCard: {
    marginLeft: '$spaceM',
  },

  lastCard: {
    marginRight: '$spaceM',
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
