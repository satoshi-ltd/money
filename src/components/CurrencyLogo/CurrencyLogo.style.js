import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  cardCurrency: {
    alignItems: 'center',
    borderRadius: '$iconSize',
    height: '$iconSize',
    justifyContent: 'center',
    padding: 0,
    width: '$iconSize',
  },

  container: {
    alignItems: 'center',
    backgroundColor: '$colorBase',
    borderRadius: '$iconSize',
    height: '$iconSize',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '$iconSize',
  },

  secondary: {
    backgroundColor: '$colorBorder',
  },
});
