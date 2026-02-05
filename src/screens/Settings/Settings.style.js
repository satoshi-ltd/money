import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: viewOffset,
  },

  hint: {
    marginTop: theme.spacing.xs,
  },

  offset: {
    marginHorizontal: viewOffset,
    width: 'auto',
  },

  dropdownWrap: {
    position: 'relative',
  },
});
