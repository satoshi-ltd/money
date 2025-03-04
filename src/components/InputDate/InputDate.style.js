import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  dateTimePicker: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },

  input: {
    backgroundColor: 'transparent',
    border: 0,
    color: '$colorContentLight',
    fontFamily: 'font-default-secondary',
    fontSize: '$fontSizeTitle',
    fontWeight: '$fontWeightDefault',
    height: '$fontSizeTitle',
    lineHeight: '$fontSizeTitle',
    margin: 0,
    marginRight: '$viewOffset / 2',
    padding: 0,
    width: '$fontSizeTitle',
  },
});
