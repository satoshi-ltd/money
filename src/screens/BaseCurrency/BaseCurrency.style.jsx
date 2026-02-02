import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  title: {
    marginBottom: '$viewOffset / 2',
  },

  list: {
    marginHorizontal: '$viewOffset * -1',

  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$spaceXL',
    width: '$spaceXL',
    padding: 0,
    marginRight: '$viewOffset / 2',
  },
  rightPlaceholder: {
    width: '$spaceL',
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: '$viewOffset',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },
});
