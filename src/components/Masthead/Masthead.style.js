import { StyleSheet } from 'react-native';

import { theme } from '../../theme';
import { columnStyle, fieldHeight, iconButtonSize, viewOffset } from '../../theme/layout';

export const getStyles = (colors) =>
  StyleSheet.create({
    // No fill: the masthead sits on whatever surface hosts it — paper on a tab, sheet on a sheet.
    wrapper: columnStyle,
    wrapperFill: { maxWidth: '100%' },
    container: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      // Fixed, so the bar never jumps between screens that carry an action and screens that do not.
      height: iconButtonSize + theme.spacing.md,
      paddingHorizontal: viewOffset,
    },
    left: {
      alignItems: 'center',
      flexShrink: 1,
      gap: theme.spacing.sm,
    },
    // The left slot always carries the identity, so a screen name is set like the wordmark beside it.
    title: {
      fontSize: theme.typography.sizes.tiny,
      letterSpacing: theme.typography.sizes.tiny * 0.145,
      flexShrink: 1,
      lineHeight: Math.round(theme.typography.sizes.tiny * 1.45),
    },
    actions: {
      flexShrink: 0,
    },
    right: {
      alignItems: 'center',
      flexShrink: 1,
      gap: theme.spacing.sm,
    },
    eyebrow: {
      flexShrink: 1,
    },
    field: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: theme.hairline,
      gap: theme.spacing.xs,
      height: iconButtonSize,
      paddingHorizontal: theme.spacing.sm,
    },
    input: {
      flex: 1,
      height: fieldHeight,
    },
    rule: {
      backgroundColor: colors.rule,
      height: theme.hairline,
    },
  });
