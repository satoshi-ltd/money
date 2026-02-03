import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  input: {
    color: '$inputColor',
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
    height: '$inputTextHeight',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingTop: '$inputPaddingVertical',
    ...Platform.select({
      web: { outlineWidth: 0 },
      android: { paddingTop: '$inputPaddingVertical + $spaceXS' },
    }),
  },
});
