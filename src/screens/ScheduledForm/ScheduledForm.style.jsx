import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { inputPaddingHorizontal, inputPaddingVertical } from '../../theme/layout';

export const style = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.md,
  },
  dayField: {
    paddingHorizontal: inputPaddingHorizontal,
    paddingVertical: inputPaddingVertical,
  },
  dayRow: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    gap: theme.spacing.xxs,
    padding: theme.spacing.xxs,
  },
  dayChip: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    flex: 1,
    height: theme.spacing.xl,
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
