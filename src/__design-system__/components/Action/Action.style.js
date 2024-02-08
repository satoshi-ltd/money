import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  action: {
    borderRadius: '$borderRadius',
    paddingVertical: '$spaceS',
  },

  text: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: '$buttonFontFamily',
    fontWeight: '$buttonFontWeight',
    gap: '$spaceXS',
  },
});
