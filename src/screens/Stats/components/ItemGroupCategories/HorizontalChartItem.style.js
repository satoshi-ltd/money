import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  bar: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    height: '100%',
    maxHeight: '$spaceL + $spaceXS',
    minWidth: '$spaceL + $spaceXS',
    position: 'absolute',
    top: 0,
  },

  content: {
    gap: '$viewOffset / 2',
    padding: '$viewOffset / 4',
  },

  detail: {
    paddingBottom: 0,
  },
});
