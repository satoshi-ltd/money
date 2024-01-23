import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  slider: {
    marginLeft: '$spaceM * -1',
    marginRight: '$spaceM * -1',
    marginBottom: '$spaceM',
  },

  card: {
    marginLeft: '$spaceS',
  },

  firstCard: {
    marginLeft: '$spaceM',
  },

  lastCard: {
    marginRight: '$spaceM',
  },

  inputCurrency: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  inputTitle: {
    marginTop: '$borderWidth * -1',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
