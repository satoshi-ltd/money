import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    color: '$colorContent',
    fontFamily: '$fontDefault',
    fontSize: '$fontSizeDefault',
    lineHeight: '$fontSizeDefault * $lineHeightBodyRatio',
  },
  title: {
    fontSize: '$fontSizeTitle',
    lineHeight: '$fontSizeTitle * $lineHeightDefaultRatio',
  },
  subtitle: {
    fontSize: '$fontSizeSubtitle',
    lineHeight: '$fontSizeSubtitle * $lineHeightDefaultRatio',
  },
  detail: {
    fontSize: '$fontSizeDetail',
    lineHeight: '$fontSizeDetail * $lineHeightDefaultRatio',
  },
  caption: {
    fontSize: '$fontSizeCaption',
    lineHeight: '$fontSizeCaption * $lineHeightDefaultRatio',
  },
  tiny: {
    fontSize: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny * $lineHeightDefaultRatio',
  },
});
