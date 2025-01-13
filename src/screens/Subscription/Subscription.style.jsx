import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  modal: {
    paddingTop: '$viewOffset',
  },

  title: {
    gap: '$viewOffset / 2',
    marginTop: '$viewOffset',
    // maxWidth: '80%',
  },

  items: {
    marginBottom: '$viewOffset',
  },

  item: {
    paddingVertical: '$viewOffset / 4',
  },

  pressableTerms: {
    height: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny * $lineHeightDefaultRatio',
  },
});
