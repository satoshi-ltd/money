import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  notification: {
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
    marginHorizontal: '$spaceM',
    marginVertical: '$spaceS',
    width: 'auto',
  },
});
