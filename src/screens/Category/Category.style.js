import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight, viewOffset } from '../../theme/layout';

const DOT_SIZE = 9;
const TRACK_WIDTH = 70;

export const getStyles = (colors) =>
  StyleSheet.create({
    identity: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: viewOffset,
      paddingTop: theme.spacing.xxs,
    },
    dot: {
      borderRadius: theme.borderRadius.full,
      height: DOT_SIZE,
      width: DOT_SIZE,
    },

    hero: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
      paddingHorizontal: viewOffset,
    },
    delta: {
      alignItems: 'baseline',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xxs,
      paddingHorizontal: viewOffset,
    },

    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: viewOffset,
    },
    row: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      height: rowHeight,
    },
    divider: {
      borderTopColor: colors.border,
      borderTopWidth: theme.hairline,
    },
    track: {
      backgroundColor: colors.surface,
      height: 5,
      width: TRACK_WIDTH,
    },
    fill: {
      backgroundColor: colors.text,
      height: '100%',
    },
    count: {
      width: 30,
    },
    amount: {
      alignItems: 'flex-end',
      width: 72,
    },

    date: {
      width: 40,
    },
    entryText: {
      gap: 1,
    },
  });
