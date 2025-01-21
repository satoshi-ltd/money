import { DefaultTheme } from '@react-navigation/native';
import StyleSheet from 'react-native-extended-stylesheet';

export const getNavigationTheme = (colorAccent) => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colorAccent || StyleSheet.value('$colorAccent'),
    background: StyleSheet.value('$colorBase'),
    card: StyleSheet.value('$colorBase'),
    text: StyleSheet.value('$colorContentLight'),
    border: StyleSheet.value('$colorBase'),
  },
});
