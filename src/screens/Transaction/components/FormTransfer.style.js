import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginLeft: '$spaceXL * -1',
    marginRight: '$spaceXL * -1',
    marginTop: '$spaceXL',
  },

  option: {
    marginLeft: '$cardGap',
  },

  firstOption: {
    marginLeft: '$spaceXL',
  },

  lastOption: {
    marginRight: '$spaceXL',
  },

  inputCurrency: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  inputVault: {
    alignItems: 'center',
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderStyle: '$inputBorderStyle',
    borderLeftWidth: '$inputBorderWidth',
    borderRightWidth: '$inputBorderWidth',
    display: 'flex',
    gap: '$spaceXS',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: '$spaceS',
    width: '100%',
  },

  inputDestination: {
    marginTop: '$borderWidth * -1',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
