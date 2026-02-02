import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  list: {
    marginBottom: '$spaceS',
    gap: '$spaceXS',
  },
  select: {
    marginBottom: '$spaceS',
    position: 'relative',
  },
  item: {
    alignItems: 'center',
    backgroundColor: '$colorBase',
    borderColor: '$colorBorder',
    borderRadius: '$borderRadius',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    paddingVertical: '$viewOffset / 2',
    paddingHorizontal: '$spaceS',
    minHeight: '$inputTextHeight',
    width: '100%',
  },
  focus: {
    borderColor: '$inputBorderColorFocus',
  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$spaceXL',
    width: '$spaceXL',
    marginRight: '$viewOffset / 2',
  },
  subline: {
    gap: '$spaceXXS',
  },
  rightPlaceholder: {
    width: '$spaceL',
  },
});
