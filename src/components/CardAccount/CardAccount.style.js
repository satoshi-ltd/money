import StyleSheet from 'react-native-extended-stylesheet';

// ! TODO - StyleSheet.value() fails!
// const spaceM = StyleSheet.value('$spaceM');
const spaceM = 16;

const CARD_SIZE = spaceM * 10;

const style = StyleSheet.create({
  card: {
    height: CARD_SIZE,
    width: CARD_SIZE,
  },

  cardCurrency: {
    height: '$spaceXXL',
    width: '$spaceXXL',
    borderRadius: '50%',
  },
});

export { CARD_SIZE, style };
