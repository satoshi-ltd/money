import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: '$spaceXS',
    borderRadius: '$borderRadius',
    backgroundColor: '$colorBase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '$spaceS',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '$spaceS',
    flex: 1,
  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  rightText: {
    textAlign: 'right',
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
});
