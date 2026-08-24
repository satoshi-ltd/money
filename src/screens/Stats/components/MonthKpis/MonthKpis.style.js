import { StyleSheet } from 'react-native';

import { theme } from '../../../../theme';
import { viewOffset } from '../../../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    block: {
      marginTop: theme.spacing.md,
      paddingHorizontal: viewOffset,
    },
    row: {
      paddingVertical: theme.spacing.xs,
    },
    kpi: {
      flex: 1,
      gap: 3,
    },
    kpiDivider: {
      borderLeftColor: colors.border,
      borderLeftWidth: theme.hairline,
      paddingLeft: theme.spacing.sm + 2,
    },
  });
