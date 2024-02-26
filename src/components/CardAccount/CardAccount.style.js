import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  card: {
    height: '$cardAccountSize',
    width: '$cardAccountSize',
  },

  // ! TODO: Should use $cardAccountSize
  cardCurrency: {
    height: '$spaceXXL',
    width: '$spaceXXL',
    borderRadius: '$spaceXXL / 2',
  },
});

export { style };
