import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  scrollView: {
    marginBottom: '$spaceXL',
    paddingRight: '$spaceM',
    maxHeight: '$cardAccountSize',
  },

  card: {
    marginLeft: '$cardGap',
  },

  container: {
    height: '100%',
  },

  firstCard: {
    marginLeft: '$spaceM',
  },

  lastCard: {
    marginRight: '$spaceM',
  },

  inputSearch: {
    marginHorizontal: '$spaceM',
  },

  sectionList: {
    flex: 1,
  },
});
