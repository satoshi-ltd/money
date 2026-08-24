import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { fieldHeight, rowHeight, viewOffset, wellSize } from '../../theme/layout';

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
      paddingHorizontal: viewOffset,
      paddingTop: theme.spacing.md,
    },
    footerMeta: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerCentered: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    coverTop: {
      paddingTop: theme.spacing.xl + theme.spacing.xxs,
    },
    stepTop: {
      paddingTop: theme.spacing.lg + theme.spacing.xxs,
    },

    headline: {
      marginTop: theme.spacing.lg + theme.spacing.xxs,
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

    searchOffset: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xxs,
    },
    search: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: theme.hairline,
      gap: theme.spacing.xs,
      height: fieldHeight,
      paddingHorizontal: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      height: fieldHeight,
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

    rule: {
      backgroundColor: colors.border,
      height: theme.hairline,
    },
    fields: {
      marginTop: theme.spacing.lg,
    },
    field: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      height: rowHeight + theme.spacing.xxs,
    },
    fieldRow: {
      flexDirection: 'row',
    },
    fieldKey: {
      width: 104,
    },
    fieldValue: {
      flex: 1,
      textAlign: 'right',
    },
    fieldInput: {
      flex: 1,
      height: rowHeight,
      textAlign: 'right',
    },
    fieldFigure: {
      fontFamily: theme.typography.fontFaces.mono,
    },
    noteOffset: {
      marginTop: theme.spacing.md,
    },

    pins: {
      gap: theme.spacing.md + 2,
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
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
      paddingHorizontal: theme.spacing.xl - 2,
    },
  });
