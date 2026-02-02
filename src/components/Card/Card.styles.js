import { StyleSheet as RNStyleSheet } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

export const styles = StyleSheet.create({
  base: {
    backgroundColor: '$colorSurface',
    borderRadius: '$borderRadius',
    padding: '$spaceS',
    overflow: 'hidden',
  },
  active: {
    backgroundColor: '$colorAccent',
  },
  small: {
    padding: '$spaceXS',
  },
});
