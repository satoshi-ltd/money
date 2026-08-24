import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

const CHIP_SIZE = 38;

export const getStyles = (colors) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.md,
    },
    group: {
      marginBottom: theme.spacing.md,
      zIndex: 1,
    },
    rowWrap: {
      position: 'relative',
      zIndex: 1,
    },
    rowWrapOpen: {
      zIndex: 2,
    },
    rowFigure: {
      flex: 1,
      fontFamily: theme.typography.fontFaces.monoMedium,
      fontSize: theme.typography.figureSizes.md,
      minHeight: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      textAlign: 'right',
    },
    rowInput: {
      flex: 1,
      fontFamily: theme.typography.fontFaces.medium,
      fontSize: theme.typography.sizes.caption,
      minHeight: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      textAlign: 'right',
    },
    repeatLabel: {
      marginBottom: theme.spacing.xs,
    },
    dayRow: {
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    dayChip: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.sm,
      height: CHIP_SIZE,
      justifyContent: 'center',
      width: CHIP_SIZE,
    },
    dayChipSelected: {
      backgroundColor: colors.accent,
    },
    preview: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },

    footer: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
  });
