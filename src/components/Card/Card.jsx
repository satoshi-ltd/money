import React, { useMemo } from 'react';

import { getStyles } from './Card.styles';
import { useApp } from '../../contexts';
import { View } from '../../primitives';

const Card = ({ active, size = 'm', style, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View {...props} style={[styles.base, size === 's' ? styles.sizeS : null, active ? styles.active : null, style]} />
  );
};

export default Card;
