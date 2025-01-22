import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: '$inputBorderColor',
    borderRadius: '$inputBorderRadius',
    borderStyle: '$inputBorderStyle',
    borderWidth: '$inputBorderWidth',
    flex: 2,
    gap: '$spaceXS',
    paddingVertical: '$viewOffset / 2',
    width: '100%',
  },
});
