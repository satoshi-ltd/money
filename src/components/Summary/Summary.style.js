import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  children: {
    marginTop: '$spaceL',
    width: '100%',
  },

  container: {
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: '$spaceXL',
    // marginHorizontal: '$spaceM',
  },

  summary: {
    flexDirection: 'row',
    marginTop: '$spaceL',
    paddingHorizontal: '$spaceXS',
    width: '100%',
  },

  summaryBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: '$spaceXS',
  },
});
