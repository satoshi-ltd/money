import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  block: {
    marginTop: theme.spacing.md,
    paddingHorizontal: viewOffset,
  },
  header: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  chart: {
    marginTop: theme.spacing.xs,
  },
  overlay: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  column: {
    height: '100%',
  },
  labels: {
    marginTop: theme.spacing.xxs,
  },
  label: {},
  legend: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs + 2,
  },
  legendItem: {
    alignItems: 'center',
    gap: theme.spacing.xxs + 2,
  },
  dot: {
    borderRadius: theme.borderRadius.full,
    height: 7,
    width: 7,
  },
});
