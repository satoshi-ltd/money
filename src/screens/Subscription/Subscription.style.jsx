import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  modal: {
    gap: '$spaceXL',
    paddingHorizontal: '$spaceL',
    paddingTop: '$spaceL',
  },

  buttons: {
    gap: '$spaceS',
  },

  optionHighlight: {
    backgroundColor: '$colorContent',
  },

  pressableTerms: {
    height: '$fontSizeTiny * 1',
    lineHeight: '$fontSizeTiny * 1',
    paddingTop: '$spaceXS / 2',
  },
});
