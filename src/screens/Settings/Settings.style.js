import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: viewOffset,
  },

  group: {
    gap: theme.spacing.sm,
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

  metaCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xs,
  },

  metaRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },

  metaText: {
    gap: theme.spacing.xxs,
    paddingLeft: theme.spacing.sm,
  },
});
