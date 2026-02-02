import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$viewOffset',
  },

  scrollView: {
    marginBottom: '$spaceM',
    paddingRight: '$viewOffset',
  },
  summary: {
    marginBottom: '$spaceL',
  },
  accountsHeading: {
    marginTop: '$spaceM',
  },
  headingTight: {
    marginTop: '$spaceXS',
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

  inputSearch: {
    marginHorizontal: '$viewOffset',
    marginBottom: '$viewOffset',
  },
});
