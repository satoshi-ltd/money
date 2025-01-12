import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$spaceXXL + $viewOffset',
    ...Platform.select({ web: { marginTop: '$viewOffset' } }),
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

  item: {
    paddingHorizontal: '$viewOffset',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },

  cardCurrency: {
    height: '$spaceXXL + $spaceS',
    marginRight: '$spaceS',
    // opacity: 0.33,
    width: '$spaceXXL + $spaceS',
  },

  currency: {
    height: '$spaceXXL + $spaceS',
    left: 0,
    lineHeight: '$spaceXXL + $spaceS',
    position: 'absolute',
    width: '$spaceXXL + $spaceS',
  },
});
