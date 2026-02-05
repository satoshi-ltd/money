import React from 'react';

import { Pressable, Text } from '../../primitives';

const Action = ({ caption, children, tone, onPress, style, ...props }) => (
  <Pressable {...props} onPress={onPress} style={style}>
    <Text bold size={caption ? 's' : 'm'} tone={tone}>
      {children}
    </Text>
  </Pressable>
);

export default Action;
