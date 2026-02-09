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
      width: 12,
      height: 12,
      borderRadius: 9999,
      position: 'absolute',
      top: 11,
      left: 20,
    },
  });
