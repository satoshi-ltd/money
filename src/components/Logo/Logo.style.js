import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const getStyles = (colors, size = theme.typography.sizes.tiny) =>
  StyleSheet.create({
    text: {
      color: colors.text,
      fontSize: size,
      letterSpacing: size * 0.145,
      lineHeight: Math.round(size * 1.45),
    },
  });
