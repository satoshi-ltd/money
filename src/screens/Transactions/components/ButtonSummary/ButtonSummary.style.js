import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: '$borderRadius',
    flex: 1,
    gap: '$spaceXXS',
    paddingVertical: '$spaceXS',
    paddingHorizontal: '$spaceS',
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '$colorBase',
    borderRadius: '$spaceXL',
    height: '$spaceXL',
    justifyContent: 'center',
    width: '$spaceXL',
  },
});
