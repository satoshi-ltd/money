import StyleSheet from 'react-native-extended-stylesheet';

// ! TODO - StyleSheet.value() fails!
const spaceXS = 4;
const layoutXL = 80;

const OPTION_SIZE = layoutXL - spaceXS;

const style = StyleSheet.create({
  $optionSize: '80 - $spaceXS',

  card: {
    height: '$optionSize',
    gap: '$spaceXXS',
    width: '$optionSize',
  },
});

export { OPTION_SIZE, style };
