import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    color: '$inputColor',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputTextFontSize',
    fontWeight: '$inputFontWeight',
    paddingHorizontal: '$inputPaddingHorizontal',
    paddingVertical: '$inputPaddingVertical',
    minHeight: '$inputTextHeight',
  },
  multiline: {
    textAlignVertical: 'top',
  },
  placeholder: {
    color: '$inputPlaceholderColor',
  },
});
