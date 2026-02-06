import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  title: {
    marginBottom: viewOffset / 2,
  },

  list: {
    marginHorizontal: viewOffset * -1,
  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: theme.spacing.xl,
    width: theme.spacing.xl,
    padding: 0,
    marginRight: viewOffset / 2,
  },
  rightPlaceholder: {
    width: theme.spacing.lg,
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: viewOffset,
    paddingVertical: viewOffset / 2,
    width: '100%',
  },
});
