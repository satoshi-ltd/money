import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { rowHeight } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    step: {
      alignItems: 'center',
      height: rowHeight,
      justifyContent: 'center',
      width: rowHeight,
    },
    stepOff: { opacity: 0.3 },
    weekdays: {
      flexDirection: 'row',
    },
    weekday: {
      flex: 1,
    },
    grid: {
      gap: theme.spacing.xxs / 2,
    },
    week: {
      flexDirection: 'row',
      gap: theme.spacing.xxs / 2,
    },
    cell: {
      flex: 1,
      minHeight: theme.spacing.xl + theme.spacing.xs,
    },
    day: {
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
    },
    dayToday: {
      borderColor: colors.border,
      borderWidth: theme.hairline,
    },
    dayChosen: {
      backgroundColor: colors.accent,
    },
    dayOff: { opacity: 0.4 },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
  });
