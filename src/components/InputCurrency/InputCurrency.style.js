import { Platform } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '$inputTextHeight',
    paddingLeft: '$inputPaddingHorizontal',
    paddingRight: '$inputPaddingHorizontal',
  },
  rowContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '$spaceS',
    flex: 1,
  },
  text: {
    color: '$inputColor',
    fontFamily: '$fontBold',
    fontSize: '$inputTextFontSize',
    fontWeight: '$fontWeightBold',
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  selectedValue: {
    fontSize: '$fontSizeDefault',
  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$spaceXL',
    width: '$spaceXL',
  },
  iconCardDropdown: {
    backgroundColor: '$colorBorder',
  },
  option: {
    paddingVertical: '$viewOffset / 2',
    paddingHorizontal: '$spaceS',
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '$spaceS',
    width: '100%',
  },
  optionTextContainer: {
    justifyContent: 'center',
  },
  optionText: {
    color: '$colorContent',
  },
});
