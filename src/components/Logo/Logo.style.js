import { StyleSheet } from 'react-native';

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      position: 'relative',
    },
    text: {
      fontSize: 22,
      lineHeight: 28,
    },
    dot: {
      backgroundColor: colors.accent,
      width: 11,
      height: 11,
      borderRadius: 9999,
      position: 'absolute',
      top: 10,
      left: 20,
    },
  });
