import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  bar: {
    backgroundColor: '$colorBorder',

    borderRadius: '$borderRadius',
    height: '100%',
    maxHeight: '$spaceL',
    minWidth: '$spaceL',
    position: 'absolute',
    left: 0,
    top: 0,
  },

  content: {
    gap: '$spaceS',
    paddingLeft: '$spaceXXS',
    paddingVertical: '$spaceXXS',
  },

  detail: {
    paddingBottom: 0,
    paddingLeft: '$spaceM',
  },
});
