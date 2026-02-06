import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { cardGap, viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  screen: {
    paddingBottom: theme.spacing.xxl * 2,
    paddingTop: viewOffset,
  },

  scrollView: {
    marginBottom: theme.spacing.lg,
  },

  card: {
    marginLeft: cardGap,
  },

  firstCard: {
    marginLeft: viewOffset,
  },

  lastCard: {
    marginRight: viewOffset,
  },

  iconSpacing: {
    marginRight: viewOffset / 2,
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: viewOffset,
    paddingVertical: viewOffset / 2,
    width: '100%',
  },
  text: {
    flex: 1,
  },
});
