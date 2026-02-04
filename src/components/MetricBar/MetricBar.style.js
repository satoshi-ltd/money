import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    gap: '$spaceXXS',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: '$spaceXXS',
    borderRadius: '$borderRadius',
    backgroundColor: '$colorBorder',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
