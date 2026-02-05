import React, { useMemo } from 'react';

import { getStyles } from './Pagination.styles';
import { useApp } from '../../contexts';
import { View } from '../../primitives';

const Pagination = ({ currentIndex = 0, length = 0, style }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View row style={[styles.container, style]}>
      {Array.from({ length }).map((_, index) => (
        <View key={`dot-${index}`} style={[styles.dot, index === currentIndex && styles.active]} />
      ))}
    </View>
  );
};

export default Pagination;
