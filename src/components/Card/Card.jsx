import React from 'react';
import { View } from '../../primitives';
import { styles } from './Card.styles';

const Card = ({ active, size = 'm', style, ...props }) => (
  <View
    {...props}
    style={[
      styles.base,
      size === 's' && styles.sizeS,
      active && styles.active,
      style,
    ]}
  />
);

export default Card;
