import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    borderColor: '$inputBorderColor',
    borderRadius: '$inputBorderRadius',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    minHeight: '$inputTextHeight',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingBottom: '$inputPaddingVertical',
    paddingTop: '$inputPaddingVertical',
  },

  focus: {
    borderColor: '$inputBorderColorFocus',
    zIndex: 1,
  },

  input: {
    bottom: 0,
    color: '$inputColor',
    fontFamily: '$inputFontFamily',
    fontSize: '$inputTextFontSize',
    fontWeight: '$inputFontWeight',
    left: 0,
    opacity: 1,
    paddingBottom: '$inputPaddingVertical + $inputBorderWidth',
    paddingRight: '$inputPaddingHorizontal',
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0,
    zIndex: 1,
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },

  value: {
    color: '$inputColor',
  },

  hide: {
    opacity: 0,
  },

  amounts: {
    alignItems: 'flex-end',
    flex: 1,
  },

  currentBalance: {
    gap: '$spaceXXS',
  },
});
