import PropTypes from 'prop-types';
import React, { useImperativeHandle, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const OPEN_VELOCITY = 500;

const SwipeRow = React.forwardRef(({ actions, actionsWidth, children }, ref) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const resting = useRef(0);

  const settle = (toValue) => {
    resting.current = toValue;
    Animated.spring(translateX, { toValue, useNativeDriver: true }).start();
  };

  useImperativeHandle(ref, () => ({ close: () => settle(0) }));

  const handleGestureEvent = ({ nativeEvent: { translationX } }) => {
    translateX.setValue(Math.min(0, Math.max(-actionsWidth, resting.current + translationX)));
  };

  const handleStateChange = ({ nativeEvent: { state, translationX, velocityX } }) => {
    if (state === State.CANCELLED || state === State.FAILED) settle(resting.current);
    if (state !== State.END) return;
    const position = Math.min(0, Math.max(-actionsWidth, resting.current + translationX));
    const open = velocityX < -OPEN_VELOCITY || (velocityX <= OPEN_VELOCITY && position < -actionsWidth / 2);
    settle(open ? -actionsWidth : 0);
  };

  return (
    <Animated.View style={styles.clip}>
      <PanGestureHandler activeOffsetX={[-10, 10]} failOffsetY={[-10, 10]} onGestureEvent={handleGestureEvent} onHandlerStateChange={handleStateChange}>
        <Animated.View style={{ transform: [{ translateX }] }}>
          {children}
          <Animated.View style={[styles.actions, { width: actionsWidth }]}>{actions}</Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

SwipeRow.displayName = 'SwipeRow';

SwipeRow.propTypes = {
  actions: PropTypes.node,
  actionsWidth: PropTypes.number.isRequired,
  children: PropTypes.node,
};

const styles = StyleSheet.create({
  actions: { bottom: 0, left: '100%', position: 'absolute', top: 0 },
  clip: { overflow: 'hidden' },
});

export { SwipeRow };
