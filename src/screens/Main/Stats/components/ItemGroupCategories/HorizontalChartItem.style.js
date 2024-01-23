import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    height: '$spaceXXL',
    marginBottom: '$spaceXXL * -1',
    minWidth: '$spaceXS',
  },

  highlight: {
    backgroundColor: '$colorAccent',
  },

  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: '$spaceS',
    height: '$spaceXXL',
    paddingLeft: '$spaceS',
    paddingRight: '$spaceXS',
  },

  detail: {
    height: 'auto',
    marginLeft: '$spaceL',
    marginVertical: '$spaceXS',
  },

  title: {
    flex: 1,
  },
});
