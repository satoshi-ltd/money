import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const style = StyleSheet.create({
  item: {
    paddingVertical: viewOffset / 4,
  },

  items: {
    marginBottom: viewOffset,
    gap: viewOffset,
  },

  lifetime: {
    marginBottom: theme.spacing.md + 2,
  },

  modal: {
    paddingTop: viewOffset,
  },

  pressableTerms: {
    height: theme.typography.sizes.tiny,
    lineHeight: theme.typography.lineHeights.tiny,
  },

  title: {
    gap: viewOffset / 2,
    marginTop: viewOffset,
  },
});
