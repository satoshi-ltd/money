import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: '$borderRadius',
    paddingHorizontal: '$spaceM',
    paddingVertical: '$spaceS',
    gap: '$spaceXS',
  },
  small: {
    paddingHorizontal: '$spaceS',
    paddingVertical: '$spaceXS',
  },
  large: {
    paddingHorizontal: '$spaceL',
    paddingVertical: '$spaceM',
  },
  iconOnly: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '$spaceXL + $spaceS',
    height: '$spaceXL + $spaceS',
  },
  iconOnlySmall: {
    width: '$spaceXL',
    height: '$spaceXL',
  },
  iconOnlyLarge: {
    width: '$spaceXXL',
    height: '$spaceXXL',
  },
  rounded: {
    borderRadius: '$borderRadius * 2',
  },
  primary: {
    backgroundColor: '$colorAccent',
  },
  secondary: {
    backgroundColor: '$colorContent',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: '$inputBorderWidth',
    borderColor: '$inputBorderColor',
  },
  disabled: {
    opacity: 0.6,
  },
});
