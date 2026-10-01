import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { dayCellHeight, rowHeight } from '../../theme/layout';

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
    week: {
      flexDirection: 'row',
    },
    cell: {
      flex: 1,
      minHeight: dayCellHeight,
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
