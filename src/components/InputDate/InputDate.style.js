import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  dateTimePicker: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },
  pressable: {
    height: '$inputTextHeight',
    justifyContent: 'center',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingVertical: '$inputPaddingVertical',
  },
  value: {
    color: '$inputColor',
  },
  valueWithLabel: {
    marginTop: '$inputPaddingVertical / 2',
  },
  inputWeb: {
    position: 'absolute',
    margin: 0,
    width: 0,
    right: 0,
  },
});
