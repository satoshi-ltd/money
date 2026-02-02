import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: '$spaceXS',
  },
  dot: {
    width: '$spaceXS',
    height: '$spaceXS',
    borderRadius: '$spaceXS',
    backgroundColor: '$colorBorder',
  },
  active: {
    backgroundColor: '$colorAccent',
  },
});
