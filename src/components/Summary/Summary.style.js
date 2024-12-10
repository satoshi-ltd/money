import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  children: {
    marginTop: '$spaceL',
    width: '100%',
  },

  container: {
    marginBottom: '$spaceL',
    paddingHorizontal: '$viewOffset',
  },

  summary: {
    flexDirection: 'row',
    marginTop: '$spaceL',
    paddingHorizontal: '$spaceXS',
    width: '100%',
  },

  progression: {
    gap: '$spaceXXS',
  },

  tags: {
    gap: '$spaceS',
  },
});
