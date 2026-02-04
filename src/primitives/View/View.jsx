import React from 'react';
import { View as RNView } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

const View = ({ row, gap, spaceBetween, align, flex, offset, style, ...props }) => {
  const resolvedGap = gap ? (typeof gap === 'number' ? gap : StyleSheet.value('$spaceS')) : null;
  const resolvedFlex = flex === true ? 1 : flex;

  return (
    <RNView
      {...props}
      style={[
        row && { flexDirection: 'row' },
        spaceBetween && { justifyContent: 'space-between' },
        align && { alignItems: align },
        resolvedFlex !== undefined ? { flex: resolvedFlex } : null,
        resolvedGap !== null ? { gap: resolvedGap } : null,
        offset ? { paddingHorizontal: StyleSheet.value('$viewOffset') } : null,
        style,
      ]}
    />
  );
};

export default View;
