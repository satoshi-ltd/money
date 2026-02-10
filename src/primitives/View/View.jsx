import React from 'react';
import { StyleSheet, View as RNView } from 'react-native';

import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  spaceBetween: { justifyContent: 'space-between' },
  offset: { paddingHorizontal: viewOffset },
});

const View = ({ row, gap, spaceBetween, align, flex, offset, style, ...props }) => {
  const resolvedGap =
    gap === undefined || gap === null
      ? null
      : gap === true
      ? theme.spacing.sm
      : typeof gap === 'number'
      ? gap
      : typeof gap === 'string'
      ? theme.spacing[gap] ?? theme.spacing.sm
      : theme.spacing.sm;
  const resolvedFlex = flex === true ? 1 : flex;

  return (
    <RNView
      {...props}
      style={[
        row ? styles.row : null,
        spaceBetween ? styles.spaceBetween : null,
        align ? { alignItems: align } : null,
        resolvedFlex !== undefined ? { flex: resolvedFlex } : null,
        resolvedGap !== null ? { gap: resolvedGap } : null,
        offset ? styles.offset : null,
        style,
      ]}
    />
  );
};

export default View;
