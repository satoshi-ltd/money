import React from 'react';
import { View } from '../../primitives';
import { styles } from './Card.styles';

const Card = ({ active, small, style, ...props }) => (
  <View
    {...props}
    style={[
      styles.base,
      small && styles.small,
      active && styles.active,
      style,
    ]}
  />
);

export default Card;
