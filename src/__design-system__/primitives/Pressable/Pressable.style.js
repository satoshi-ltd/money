import StyleSheet from 'react-native-extended-stylesheet';

import { colorOpacity } from '../../../modules';

export const style = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },

  overflow: {
    backgroundColor: () => colorOpacity(StyleSheet.value('$colorBase'), 0.33),
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    margin: 0,
  },
});
