import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    marginBottom: '$viewOffset',
  },

  content: {
    gap: '$viewOffset / 2',
    marginHorizontal: '$viewOffset',
  },

  touchable: {
    width: '100%',
  },
});
