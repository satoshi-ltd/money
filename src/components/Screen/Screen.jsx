import React, { useMemo } from 'react';

import { getStyles } from './Screen.styles';
import { useApp } from '../../contexts';
import { ScrollView, View } from '../../primitives';

const Screen = React.forwardRef(({ children, disableScroll, gap, offset, style, ...props }, ref) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const contentStyle = [styles.base, offset && styles.offset, gap && styles.gap, style];

  if (disableScroll) {
    return (
      <View {...props} style={contentStyle}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView ref={ref} {...props} contentContainerStyle={contentStyle}>
      {children}
    </ScrollView>
  );
});

Screen.displayName = 'Screen';

export default Screen;
