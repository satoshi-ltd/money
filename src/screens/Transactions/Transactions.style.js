import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  screen: {
    paddingTop: '$viewOffset',
    ...Platform.select({ web: { marginTop: '$spaceXXL + $viewOffset' } }),
  },

  buttons: {
    gap: '$viewOffset / 2',
  },
});
