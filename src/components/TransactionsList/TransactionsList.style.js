import { StyleSheet } from 'react-native';

import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingHorizontal: viewOffset,
      gap: viewOffset / 2,
      paddingVertical: viewOffset / 2,
      width: '100%',
    },
    headerContainer: {
      backgroundColor: colors.background,
    },
    date: {
      marginTop: viewOffset / 2,
      marginLeft: viewOffset,
    },
    text: {
      flex: 1,
    },
  });
