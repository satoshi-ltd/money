import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
  },

  scrollView: {
    marginBottom: '$spaceL',
  },

  card: {
    marginLeft: '$cardGap',
  },

  firstCard: {
    marginLeft: '$viewOffset',
  },

  lastCard: {
    marginRight: '$viewOffset',
  },

  cardCurrency: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$spaceXL',
    width: '$spaceXL',
    marginRight: '$viewOffset / 2',
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: '$viewOffset',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },
  text: {
    flex: 1,
  },
});
