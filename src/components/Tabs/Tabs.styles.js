import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '$colorBorder',
    borderRadius: '$borderRadius',
    padding: '$spaceXXS',
  },
  tab: {
    paddingVertical: '$spaceXS',
    paddingHorizontal: '$spaceM',
    borderRadius: '$borderRadius',
  },
  active: {
    backgroundColor: '$colorAccent',
  },
  activeAlt: {
    backgroundColor: '$colorContent',
  },
});
