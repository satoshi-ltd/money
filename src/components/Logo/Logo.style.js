import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    psition: 'relative',
  },

  text: {
    fontSize: 24,
    lineHeight: `24 * $lineHeightDefaultRatio`,
  },

  color: {
    backgroundColor: '$colorAccent',
    height: 13,
    width: 13,
    borderRadius: '50%',
    position: 'absolute',
    top: 11,
    left: 22,
  },
});
