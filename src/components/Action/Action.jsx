import React from 'react';

import { Pressable, Text } from '../../design-system';

const Action = ({ caption, children, color, onPress, style, ...props }) => (
  <Pressable {...props} onPress={onPress} style={style}>
    <Text bold size={caption ? 's' : 'm'} color={color}>
      {children}
    </Text>
  </Pressable>
);

export default Action;
