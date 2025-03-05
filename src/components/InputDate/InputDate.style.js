import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  dateTimePicker: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
  },

  inputWeb: {
    position: 'absolute',
    margin: 0,
    width: 0,
    right: 0,
  },

  pressable: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    paddingHorizontal: '$spaceS',
    paddingVertical: '$spaceXS',
  },
});
