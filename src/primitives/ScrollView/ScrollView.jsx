import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

const ScrollView = React.forwardRef(({ snapTo, style, decelerationRate, ...props }, ref) => (
  <RNScrollView
    ref={ref}
    decelerationRate={snapTo ? 'fast' : decelerationRate}
    snapToInterval={snapTo || undefined}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    {...props}
    style={style}
  />
));

ScrollView.displayName = 'ScrollView';

export default ScrollView;
