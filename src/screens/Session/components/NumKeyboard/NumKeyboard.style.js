import { StyleSheet } from 'react-native';

const KEY_HEIGHT = 54;
const KEYPAD_OFFSET = 30;

export const style = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: KEYPAD_OFFSET,
    width: '100%',
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
