import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

const GRID_PADDING = 10;

export const getStyles = (colors, height = 112) =>
  StyleSheet.create({
    block: {
      paddingHorizontal: viewOffset,
    },
    heroRow: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
    },
    chart: {
      marginTop: theme.spacing.xs,
      position: 'relative',
    },
    gridLabels: {
      height: height - GRID_PADDING * 2,
      justifyContent: 'space-between',
      left: 0,
      position: 'absolute',
      top: GRID_PADDING - theme.spacing.sm,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    column: {
      flex: 1,
    },
    axis: {
      justifyContent: 'space-between',
      marginTop: theme.spacing.xxs,
    },
  });
