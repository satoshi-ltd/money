import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

// The app icon is the one place the mark inverts, so its two colours are fixed and ignore the theme.
const PLATE = theme.colors.light.text;
const LETTERS = theme.colors.light.background;

export const getStyles = (size) =>
  StyleSheet.create({
    plate: {
      alignItems: 'center',
      backgroundColor: PLATE,
      height: size,
      justifyContent: 'center',
      width: size,
    },
    letters: {
      color: LETTERS,
      fontFamily: theme.typography.fontFaces.bold,
      fontSize: size * 0.42,
      letterSpacing: size * 0.06 * 0.42,
    },
  });
