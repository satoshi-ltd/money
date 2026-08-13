import React, { useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { getStyles } from './Screen.styles';
import { useApp } from '../../contexts';
import { useKeyboardInset } from '../../hooks';
import { getFocusedInput, ScrollView, View } from '../../primitives';

const isAndroid = Platform.OS === 'android';
const FOCUS_MARGIN = 24;

const Screen = React.forwardRef(({ children, disableScroll, gap, offset, style, ...props }, ref) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const keyboardInset = useKeyboardInset();

  const innerRef = useRef();
  const viewportRef = useRef(0);
  const scrollRef = ref || innerRef;

  const handleLayout = useCallback(
    (event) => {
      viewportRef.current = event.nativeEvent.layout.height;
      props.onLayout?.(event);
    },
    [props],
  );

  const scrollFocusedIntoView = useCallback(() => {
    const scroll = scrollRef.current;
    const input = getFocusedInput();
    if (!scroll || !input || !keyboardInset) return;

    const content = scroll.getInnerViewNode?.();
    if (!content) return;

    input.measureLayout(
      content,
      (x, y, width, height) => {
        const visible = viewportRef.current - keyboardInset;
        const overflow = y + height + FOCUS_MARGIN - visible;
        if (overflow > 0) scroll.scrollTo({ y: overflow, animated: true });
      },
      () => {},
    );
  }, [keyboardInset, scrollRef]);

  const contentStyle = [styles.base, offset && styles.offset, gap && styles.gap, style];
  const keyboardSpacer = keyboardInset ? <View style={{ height: keyboardInset }} /> : null;

  if (disableScroll) {
    return (
      <View {...props} style={contentStyle}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      automaticallyAdjustKeyboardInsets={!isAndroid}
      keyboardDismissMode="on-drag"
      {...props}
      contentContainerStyle={contentStyle}
      onLayout={handleLayout}
      onContentSizeChange={scrollFocusedIntoView}
    >
      {children}
      {keyboardSpacer}
    </ScrollView>
  );
});

Screen.displayName = 'Screen';

export default Screen;
