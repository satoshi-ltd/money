import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: viewOffset,
  },

  chartMargin: {
    marginBottom: theme.spacing.lg,
  },
  chartGap: {
    marginTop: theme.spacing.md,
  },
  sectionGap: {
    marginTop: theme.spacing.md,
  },
});
