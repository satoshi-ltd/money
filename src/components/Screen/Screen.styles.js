import { StyleSheet } from 'react-native';

import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    base: {
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
