import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    position: 'relative',
  },

  text: {
    fontSize: 22,
    lineHeight: `22 * $lineHeightDefaultRatio`,
  },

  color: {
    backgroundColor: '$colorAccent',
    maxWidth: 11,
    maxHeight: 11,
    minWidth: 11,
    minHeight: 11,
    height: 11,
    width: 11,
    borderRadius: '50%',
    position: 'absolute',
    top: 10,
    left: 20,
  },
});
