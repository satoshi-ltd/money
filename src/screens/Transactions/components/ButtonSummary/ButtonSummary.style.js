import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: '$colorBorder',
    borderRadius: '$borderRadius',
    borderStyle: '$borderStyle',
    borderWidth: '1px',
    flex: 2,
    gap: '$spaceXS',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },
});
