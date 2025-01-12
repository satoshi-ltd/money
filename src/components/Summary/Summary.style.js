import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  children: {
    gap: '$viewOffset',
    marginTop: '$viewOffset',
    width: '100%',
  },

  container: {
    marginBottom: '$viewOffset',
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

  color: {
    borderRadius: '50%',
    height: '$fontSizeTiny',
    marginRight: '$spaceXS',
    width: '$fontSizeTiny',
  },

  tags: {
    gap: '$spaceS',
  },

  tag: {
    gap: '$spaceXXS',
  },

  income: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    paddingHorizontal: '$spaceXS',
    paddingVertical: '$spaceXXS',
  },
});
