import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  card: {
    height: '$cardAccountSize',
    width: '$cardAccountSize',
  },

  color: {
    borderRadius: '50%',
    height: '$fontSizeTiny',
    marginRight: '$spaceXS',
    width: '$fontSizeTiny',
  },

  chart: {
    bottom: '$spaceXS',
    left: 0,
    opacity: 0.66,
    position: 'absolute',
  },

  percentage: {
    textShadowColor: '$colorBorder',
    textShadowRadius: 4,
  },
});

export { style };
