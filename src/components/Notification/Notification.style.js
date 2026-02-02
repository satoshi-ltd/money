import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  notification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    width: '100%',
  },

  accent: {
    backgroundColor: '$colorAccent',
  },

  alert: {
    backgroundColor: '$colorError',
  },

  info: {
    backgroundColor: '$colorContent',
  },

  text: {
    flex: 1,
  },

  safeAreaView: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '$spaceS',
    marginHorizontal: '$viewOffset',
    marginVertical: '$viewOffset / 2',
    width: 'auto',
  },
});
