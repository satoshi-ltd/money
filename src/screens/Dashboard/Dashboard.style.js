import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL * 2',
    paddingTop: '$spaceXXL + $viewOffset',
    ...Platform.select({ web: { marginTop: '$viewOffset' } }),
  },

  scrollView: {
    marginBottom: '$spaceXL',
    paddingRight: '$spaceM',
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
