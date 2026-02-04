import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

const ScrollView = React.forwardRef(({ snap, width, style, decelerationRate, ...props }, ref) => (
  <RNScrollView
    ref={ref}
    decelerationRate={snap ? 'fast' : decelerationRate}
    snapToInterval={snap || undefined}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    {...props}
    style={[width ? { width } : null, style]}
  />
));

ScrollView.displayName = 'ScrollView';

export default ScrollView;
