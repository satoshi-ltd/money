import { StyleSheet } from 'react-native';

import { theme } from '../../theme';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: 0,
  },
  chartGap: {
    marginTop: theme.spacing.md,
  },
  sectionGap: {
    marginTop: theme.spacing.xxs,
  },
});
