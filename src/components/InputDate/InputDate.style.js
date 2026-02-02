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
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingTop: '$inputPaddingVertical',
    justifyContent: 'center',
  },
  value: {
    color: '$inputColor',
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
  },
  inputWeb: {
    position: 'absolute',
    margin: 0,
    width: 0,
    right: 0,
  },
});
