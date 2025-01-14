import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingTop: '$spaceXXL + $viewOffset',
    ...Platform.select({ web: { marginTop: '$viewOffset' } }),
  },

  buttons: {
    gap: '$viewOffset / 2',
  },

  inputSearch: {
    marginHorizontal: '$viewOffset',
    marginBottom: '$viewOffset',
  },
});
