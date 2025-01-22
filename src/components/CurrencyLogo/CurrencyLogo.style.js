import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    height: '$spaceXL - $spaceXS',
    width: '$spaceXL - $spaceXS',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coin: {
    backgroundColor: '$colorContent',
    borderRadius: '50%',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },

  colorCurrency: {
    opacity: 0.25,
  },

  highlight: {
    backgroundColor: '$colorBase',
  },
});
