import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const styles = StyleSheet.create({
  container: {
    marginBottom: viewOffset,
  },
  content: {
    paddingHorizontal: viewOffset,
    paddingVertical: viewOffset / 2,
    width: '100%',
  },
  date: {
    marginLeft: viewOffset,
  },
  text: {
    flex: 1,
  },
  cardIcon: {
    height: theme.spacing.xxl + theme.spacing.sm,
    width: theme.spacing.xxl + theme.spacing.sm,
    marginRight: viewOffset / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
