import { StyleSheet } from 'react-native';

import { theme } from '../../../theme';
import { rowHeight } from '../../../theme/layout';


export const style = StyleSheet.create({
  suggestion: {
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },


  group: {
    marginBottom: theme.spacing.md,
    zIndex: 1,
  },
  rowWrap: {
    position: 'relative',
    zIndex: 1,
  },
  // An open dropdown has to outrank the rows below it, or they paint over it and swallow its touches.
  rowWrapOpen: {
    zIndex: 2,
  },
  row: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: rowHeight,
  },
  rowLabel: {
    width: theme.spacing.xxl * 2,
  },
  rowValue: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.xs,
    justifyContent: 'flex-end',
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
});
