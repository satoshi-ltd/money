import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },

  scrollView: {
    ...Platform.select({ web: { flex: 1 } }),
  },
});
