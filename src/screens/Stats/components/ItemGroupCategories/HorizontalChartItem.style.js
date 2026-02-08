import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';

export const getStyles = (colors) =>
  StyleSheet.create({
    item: {
      paddingVertical: theme.spacing.xxs / 2,
      paddingLeft: 0,
    },

    detail: {
      marginLeft: 0,
    },

    detailItem: {
      paddingVertical: theme.spacing.xxs / 2,
      paddingLeft: 0,
    },
  });
