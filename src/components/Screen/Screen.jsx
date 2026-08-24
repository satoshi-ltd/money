import React, { useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { getStyles } from './Screen.styles';
import { useApp } from '../../contexts';
import { useKeyboardInset } from '../../hooks';
import { getFocusedInput, ScrollView, View } from '../../primitives';

const isAndroid = Platform.OS === 'android';
const FOCUS_MARGIN = 24;

const Screen = React.forwardRef(({ children, disableScroll, gap, keyboardSpacer = true, offset, style, ...props }, ref) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { height: keyboardHeight, top: keyboardTop } = useKeyboardInset();

  const innerRef = useRef();
  const offsetRef = useRef(0);
  const scrollRef = ref || innerRef;

  const handleScroll = useCallback(
    (event) => {
      offsetRef.current = event.nativeEvent.contentOffset.y;
      props.onScroll?.(event);
    },
    [props],
  );

  const scrollFocusedIntoView = useCallback(() => {
    const scroll = scrollRef.current;
    const input = getFocusedInput();
    if (!scroll || !input?.measureInWindow || !keyboardTop) return;

    input.measureInWindow((x, y, width, height) => {
      const overflow = y + height + FOCUS_MARGIN - keyboardTop;
      if (overflow > 0) scroll.scrollTo({ y: offsetRef.current + overflow, animated: true });
    });
  }, [keyboardTop, scrollRef]);

  const contentStyle = [styles.base, offset && styles.offset, gap && styles.gap, style];
  const spacer = keyboardSpacer && keyboardHeight ? <View style={{ height: keyboardHeight }} /> : null;

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
      nestedScrollEnabled
      scrollEventThrottle={16}
      {...props}
      contentContainerStyle={contentStyle}
      style={styles.flex}
      onScroll={handleScroll}
      onContentSizeChange={scrollFocusedIntoView}
    >
      {children}
      {spacer}
    </ScrollView>
  );
});

Screen.displayName = 'Screen';

export default Screen;
