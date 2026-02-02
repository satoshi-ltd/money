import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    borderColor: '$inputBorderColor',
    // borderRadius: '$inputBorderRadius',
    borderStyle: '$inputBorderStyle',
    // borderTopColor: 'transparent',
    borderWidth: '$inputBorderWidth',
    minHeight: '$inputTextHeight',
  },
  first: {
    borderTopLeftRadius: '$inputBorderRadius',
    borderTopRightRadius: '$inputBorderRadius',
  },
  last: {
    borderBottomLeftRadius: '$inputBorderRadius',
    borderBottomRightRadius: '$inputBorderRadius',
  },
  focus: {
    borderColor: '$inputBorderColorFocus',
  },
  label: {
    position: 'absolute',
    left: '$inputPaddingHorizontal',
    top: '$inputPaddingVertical - $spaceXXS',
    zIndex: 1,
  },
});
