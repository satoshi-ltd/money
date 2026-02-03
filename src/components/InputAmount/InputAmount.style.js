import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '$spaceS',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
  },

  input: {
    color: '$inputColor',
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
    height: '$inputTextHeight',
    paddingTop: '$inputPaddingVertical',
    flex: 1,
    ...Platform.select({
      web: { outlineWidth: 0 },
      android: { paddingTop: '$inputPaddingVertical + $spaceXS' },
    }),
  },
  exchange: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  value: {
    color: '$inputColor',
  },

});
