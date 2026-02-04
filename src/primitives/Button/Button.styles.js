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
    minHeight: 44,
  },
  grow: {
    flex: 1,
  },
  small: {
    paddingHorizontal: '$spaceS',
    paddingVertical: '$spaceXS',
    minHeight: 36,
  },
  large: {
    paddingHorizontal: '$spaceL',
    paddingVertical: '$spaceM',
    minHeight: 52,
  },
  iconOnly: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '$spaceXL + $spaceS',
    height: '$spaceXL + $spaceS',
    minWidth: '$spaceXL + $spaceS',
    minHeight: '$spaceXL + $spaceS',
  },
  iconOnlySmall: {
    width: '$spaceXL',
    height: '$spaceXL',
    minWidth: '$spaceXL',
    minHeight: '$spaceXL',
  },
  iconOnlyLarge: {
    width: '$spaceXXL',
    height: '$spaceXXL',
    minWidth: '$spaceXXL',
    minHeight: '$spaceXXL',
  },
  primary: {
    backgroundColor: '$colorAccent',
  },
  secondary: {
    backgroundColor: '$colorContent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: '$inputBorderWidth',
    borderColor: '$inputBorderColor',
  },
  disabledPrimary: {
    backgroundColor: '$colorBorder',
  },
  disabledSecondary: {
    backgroundColor: '$colorBorder',
  },
  disabledOutlined: {
    borderColor: '$colorBorder',
  },
  disabledGhost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.92,
  },
});
