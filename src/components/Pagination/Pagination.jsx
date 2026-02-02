import React from 'react';

import { View } from '../../design-system';
import { styles } from './Pagination.styles';

const Pagination = ({ currentIndex = 0, length = 0, style }) => (
  <View row style={[styles.container, style]}>
    {Array.from({ length }).map((_, index) => (
      <View key={`dot-${index}`} style={[styles.dot, index === currentIndex && styles.active]} />
    ))}
  </View>
);

export default Pagination;
