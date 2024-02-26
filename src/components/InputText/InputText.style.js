import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    borderColor: '$inputBorderColor',
    borderRadius: '$inputBorderRadius',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    minHeight: '$inputTextHeight',
  },

  focus: {
    borderColor: '$inputBorderColorFocus',
    zIndex: 1,
  },

  input: {
    color: '$inputColor',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputTextFontSize',
    fontWeight: '$inputFontWeight',
    height: '$inputTextHeight',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingBottom: '$inputPaddingVertical',
    paddingTop: '$inputPaddingVertical + $spaceM',
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },

  label: {
    position: 'absolute',
    left: '$inputPaddingHorizontal',
    top: '$inputPaddingVertical - $spaceXS',
  },
});
