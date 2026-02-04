import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    borderWidth: '$inputBorderWidth',
    borderColor: '$inputBorderColor',
    borderRadius: '$inputBorderRadius',
    backgroundColor: '$colorBase',
    color: '$inputColor',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputTextFontSize',
    fontWeight: '$inputFontWeight',
    paddingHorizontal: '$inputPaddingHorizontal',
    paddingVertical: '$inputPaddingVertical',
    minHeight: '$inputTextHeight',
  },
  search: {
    borderWidth: 0,
    backgroundColor: '$colorBorder',
  },
  multiline: {
    textAlignVertical: 'top',
  },
  placeholder: {
    color: '$inputPlaceholderColor',
  },
});
