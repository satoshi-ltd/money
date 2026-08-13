import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { getStyles } from './Screen.styles';
import { useApp } from '../../contexts';
import { ScrollView, View } from '../../primitives';

const isAndroid = Platform.OS === 'android';

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
});

const Screen = React.forwardRef(({ children, disableScroll, gap, offset, style, ...props }, ref) => {
  const { colors } = useApp();
  const dynamicStyles = useMemo(() => getStyles(colors), [colors]);
  const contentStyle = [dynamicStyles.base, offset && dynamicStyles.offset, gap && dynamicStyles.gap, style];

  if (disableScroll) {
    return (
      <View {...props} style={contentStyle}>
        {children}
      </View>
    );
  }

  const scroll = (
    <ScrollView
      ref={ref}
      automaticallyAdjustKeyboardInsets={!isAndroid}
      keyboardDismissMode="on-drag"
      {...props}
      contentContainerStyle={contentStyle}
    >
      {children}
    </ScrollView>
  );

  return isAndroid ? (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardAvoid}>
      {scroll}
    </KeyboardAvoidingView>
  ) : (
    scroll
  );
});

Screen.displayName = 'Screen';

export default Screen;
