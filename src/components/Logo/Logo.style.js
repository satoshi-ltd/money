import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    position: 'relative',
  },

  text: {
    fontSize: 24,
    lineHeight: `24 * $lineHeightDefaultRatio`,
  },

  color: {
    backgroundColor: '$colorAccent',
    maxWidth: 13,
    maxHeight: 13,
    minWidth: 13,
    minHeight: 13,
    height: 13,
    width: 13,
    borderRadius: '50%',
    position: 'absolute',
    top: 11,
    left: 22,
  },
});
