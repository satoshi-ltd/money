import { StyleSheet } from 'react-native';

import { columnStyle, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    base: {
      ...columnStyle,
      backgroundColor: colors.background,
      paddingBottom: viewOffset,
    },
    offset: {
      paddingHorizontal: viewOffset,
    },
    gap: {
      gap: viewOffset,
    },
  });
