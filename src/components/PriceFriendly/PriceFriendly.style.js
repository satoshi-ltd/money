import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    gap: '$spaceXXS / 2',
  },

  highlight: {
    backgroundColor: '$colorAccent',
    borderRadius: '$borderRadius',
    marginRight: `$spaceXS * -1`,
    paddingHorizontal: '$spaceXS',
  },

  symbol: {
    transform: [{ scale: 0.85 }],
  },
});
