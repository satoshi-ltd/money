import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    gap: '$spaceXXS / 2',
  },

  highlight: {
    backgroundColor: '$colorAccent',
    borderRadius: '$spaceXS',
    marginRight: `$spaceXS * -1`,
    paddingHorizontal: '$spaceXS',
    paddingVertical: '$spaceXXS / 2',
  },

  symbol: {
    transform: [{ scale: 0.85 }],
  },
});
