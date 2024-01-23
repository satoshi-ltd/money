import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: '$spaceXS',
    marginHorizontal: '$spaceS + $spaceXS',
  },

  button: {
    backgroundColor: '$colorAccent',
    borderRadius: '$spaceXXL',
    height: '$spaceXXL + $spaceS',
    width: '$spaceXXL + $spaceS',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
