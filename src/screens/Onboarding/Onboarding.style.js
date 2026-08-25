import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight, viewOffset, wellSize } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingBottom: theme.spacing.md,
    },
    pad: {
      paddingHorizontal: viewOffset,
    },
    footer: {
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: viewOffset,
      paddingTop: theme.spacing.md,
    },

    coverTop: {
      paddingTop: theme.spacing.xl + theme.spacing.xxs,
    },
    stepTop: {
      paddingTop: theme.spacing.lg + theme.spacing.xxs,
    },

    headline: {
      marginTop: theme.spacing.xl,
    },
    caption: {
      marginTop: theme.spacing.xs,
      maxWidth: 300,
    },
    note: {
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
    },

    claims: {
      marginTop: theme.spacing.lg,
    },
    claim: {
      alignItems: 'flex-start',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs + 1,
    },
    claimDivider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    claimIndex: {
      width: 18,
    },

    groupOffset: {
      marginTop: theme.spacing.md,
    },
    groupFirst: {
      marginTop: theme.spacing.lg,
    },
    groupLabel: {
      marginBottom: theme.spacing.xs,
    },

    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      height: rowHeight,
    },
    rowDivider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    well: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.sm,
      height: wellSize,
      justifyContent: 'center',
      width: wellSize,
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
    rowFigure: {
      flex: 1,
      fontFamily: theme.typography.fontFaces.monoMedium,
      fontSize: theme.typography.figureSizes.md,
      minHeight: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      textAlign: 'right',
    },
    fields: {
      marginTop: theme.spacing.lg,
    },
    noteOffset: {
      marginTop: theme.spacing.md,
    },

    pins: {
      gap: theme.spacing.md + 2,
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    pin: {
      borderRadius: theme.borderRadius.full,
      height: 14,
      width: 14,
    },
    pinOn: {
      backgroundColor: colors.accent,
    },
    pinOff: {
      borderColor: colors.textMuted,
      borderWidth: 1.5,
    },
    keyboard: {
      justifyContent: 'flex-end',
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl - 2,
    },
  });
