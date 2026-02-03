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
  stacked: {
    marginBottom: 0,
  },
  dropdownOption: {
    paddingVertical: '$viewOffset / 2',
    paddingHorizontal: '$spaceS',
  },
  dropdownRow: {
    alignItems: 'center',
    width: '100%',
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
  first: {
    borderTopLeftRadius: '$inputBorderRadius',
    borderTopRightRadius: '$inputBorderRadius',
  },
  last: {
    borderBottomLeftRadius: '$inputBorderRadius',
    borderBottomRightRadius: '$inputBorderRadius',
  },
  noBottom: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  iconCardDropdown: {
    backgroundColor: '$colorBorder',
  },
  textContainer: {
    justifyContent: 'center',
  },
  text: {
    color: '$colorContent',
  },
  subline: {
    gap: '$spaceXXS',
  },
  rightPlaceholder: {
    width: '$spaceL',
  },
});
