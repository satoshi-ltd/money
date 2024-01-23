import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  slider: {
    marginLeft: '$spaceXL * -1',
    marginRight: '$spaceXL * -1',
    marginTop: '$spaceXL',
  },

  card: {
    marginLeft: '$spaceS',
  },

  firstCard: {
    marginLeft: '$spaceXL',
  },

  lastCard: {
    marginRight: '$spaceXL',
  },

  inputCurrency: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  inputVault: {
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderStyle: '$borderStyle',
    borderLeftWidth: '$borderWidth',
    borderRightWidth: '$borderWidth',
    display: 'flex',
    gap: '$spaceXS',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '$spaceS',
    width: '100%',
  },

  inputTitle: {
    marginTop: '$borderWidth * -1',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
