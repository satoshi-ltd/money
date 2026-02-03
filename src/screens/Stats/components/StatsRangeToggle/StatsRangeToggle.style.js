import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    backgroundColor: '$colorSurface',
    borderRadius: '$borderRadius',
    gap: '$spaceXXS',
    padding: '$spaceXXS',
  },
  item: {
    borderRadius: '$borderRadius',
    paddingHorizontal: '$spaceXS',
    paddingVertical: '$spaceXXS',
  },
  itemActive: {
    backgroundColor: '$colorAccent',
  },
});
