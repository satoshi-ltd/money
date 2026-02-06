import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const style = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.md,
  },
  dayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  dayChip: {
    borderRadius: theme.borderRadius.xs,
    height: theme.spacing.xl,
    minWidth: theme.spacing.xl * 1.4,
    paddingHorizontal: theme.spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryScroll: {
    marginTop: theme.spacing.xs,
  },
  option: {
    marginRight: theme.spacing.sm,
  },
});
