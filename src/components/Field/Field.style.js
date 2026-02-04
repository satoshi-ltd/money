import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    borderColor: '$inputBorderColor',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    minHeight: '$inputTextHeight',
  },
  noBottom: {
    borderBottomWidth: 0,
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
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '$spaceS',
  },
  suffix: {
    paddingRight: '$inputPaddingHorizontal',
  },
});
