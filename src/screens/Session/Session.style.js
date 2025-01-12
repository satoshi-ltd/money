import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  content: {
    alignItems: 'center',
    gap: '$viewOffset',
  },

  pinCode: {
    flexDirection: 'row',
    marginBottom: '$spaceL',
  },

  pin: {
    backgroundColor: '$colorBorder',
    borderRadius: '$spaceM / 2',
    height: '$spaceM',
    marginHorizontal: '$spaceS',
    width: '$spaceM',
  },

  pinActive: {
    backgroundColor: '$colorAccent',
  },
});
