import { StyleSheet } from 'react-native';

import { columnStyle } from '../../../../theme/layout';

const KEY_HEIGHT = 54;
const KEYPAD_OFFSET = 30;

export const style = StyleSheet.create({
  container: {
    ...columnStyle,
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: KEYPAD_OFFSET,
  },

  pressable: {
    width: '33.333%',
  },

  key: {
    alignItems: 'center',
    height: KEY_HEIGHT,
    justifyContent: 'center',
  },
});
