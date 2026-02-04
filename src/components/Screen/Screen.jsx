import React from 'react';

import { ScrollView, View } from '../../primitives';
import { styles } from './Screen.styles';

const Screen = ({ children, disableScroll, gap, offset, style, ...props }) => {
  const contentStyle = [styles.base, offset && styles.offset, gap && styles.gap, style];

  if (disableScroll) {
    return (
      <View {...props} style={contentStyle}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView {...props} contentContainerStyle={contentStyle}>
      {children}
    </ScrollView>
  );
};

export default Screen;
