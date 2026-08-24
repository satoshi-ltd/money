import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

const WELL_SIZE = 56;
const ACTION_WIDTH = 200;

export const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: viewOffset * 2,
      paddingVertical: theme.spacing.xl,
    },
    well: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.sm,
      height: WELL_SIZE,
      justifyContent: 'center',
      width: WELL_SIZE,
    },
    title: {
      marginTop: theme.spacing.md,
    },
    caption: {
      marginTop: theme.spacing.xs,
      maxWidth: 250,
    },
    action: {
      marginTop: theme.spacing.lg + theme.spacing.xxs,
      width: ACTION_WIDTH,
    },
  });
