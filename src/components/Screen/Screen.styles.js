import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    backgroundColor: '$colorBase',
    paddingBottom: '$viewOffset',
  },
  offset: {
    paddingHorizontal: '$viewOffset',
  },
  gap: {
    gap: '$viewOffset',
  },
});
