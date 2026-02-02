import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  card: {
    height: '$cardAccountSize',
    width: '$cardAccountSize',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  color: {
    borderRadius: '50%',
    height: '$fontSizeTiny',
    marginRight: '$spaceXS',
    width: '$fontSizeTiny',
  },

  chart: {
    bottom: '$spaceXS',
    left: '$spaceS * -1',
    opacity: 0.66,
    position: 'absolute',
  },
});

export { style };
