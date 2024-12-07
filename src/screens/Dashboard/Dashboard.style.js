import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: '$spaceXXL',
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
    marginLeft: '$spaceM',
  },

  lastCard: {
    marginRight: '$spaceM',
  },

  inputSearch: {
    marginHorizontal: '$spaceM',
  },
});
