import React from 'react';
import { Pressable as RNPressable } from 'react-native';

const Pressable = React.forwardRef((props, ref) => <RNPressable ref={ref} {...props} />);

Pressable.displayName = 'Pressable';

export default Pressable;
