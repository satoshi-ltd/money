import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 3,
    paddingTop: viewOffset,
  },

  group: {
    gap: theme.spacing.xxs,
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

  idsBlock: {
    marginTop: theme.spacing.xs,
    width: '100%',
    alignItems: 'center',
  },
});
