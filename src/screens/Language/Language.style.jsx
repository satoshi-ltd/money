import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const style = StyleSheet.create({
  list: {
    marginTop: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: theme.spacing.lg,
  },
});
