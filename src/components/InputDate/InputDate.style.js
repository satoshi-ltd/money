import { StyleSheet } from 'react-native';

import { inputPaddingHorizontal, inputPaddingVertical, inputTextHeight } from '../../theme/layout';

export const styles = StyleSheet.create({
  dateTimePicker: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
  pressable: {
    minHeight: inputTextHeight,
    justifyContent: 'center',
    paddingLeft: inputPaddingHorizontal,
    paddingRight: inputPaddingHorizontal,
    paddingVertical: inputPaddingVertical,
  },
  pressableWithLabel: {
    paddingTop: inputPaddingVertical * 2,
    paddingBottom: inputPaddingVertical / 2,
  },
  valueWithLabel: {
    marginTop: inputPaddingVertical / 2,
  },
});
