import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  input: {
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
    ...Platform.select({
      web: { outlineWidth: 0 },
      android: { paddingTop: '$inputPaddingVertical + $spaceXS' },
    }),
  },
});
