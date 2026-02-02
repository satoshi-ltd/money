import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '$inputTextHeight',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
    paddingTop: '$inputPaddingVertical',
  },
  text: {
    color: '$inputColor',
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
});

