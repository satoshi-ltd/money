import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    heading: {
      alignItems: 'baseline',
      borderBottomColor: colors.rule,
      borderBottomWidth: theme.hairline,
      paddingBottom: theme.spacing.xs,
    },
    actions: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    offset: {
      marginHorizontal: viewOffset,
    },
  });
