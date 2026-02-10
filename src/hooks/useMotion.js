import { useRef, useCallback } from 'react';
import { Animated, LayoutAnimation, Easing, Platform, UIManager } from 'react-native';

import { theme } from '../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export const useMotion = () => {
  // We need stable Animated.Value instances without calling Hooks from callbacks.
  // `createValue()` must be called unconditionally and in a stable order across renders
  // (similar to Hooks rules) to avoid returning mismatched values.
  const valuePoolRef = useRef([]);
  const valueCursorRef = useRef(0);
  valueCursorRef.current = 0;

  const animateLayout = useCallback((expanding = true) => {
    const duration = expanding ? theme.animations.duration.standard : theme.animations.duration.quick;

    const config = {
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration,
    };

    LayoutAnimation.configureNext(config);
  }, []);

  const animateValue = useCallback((value, toValue, options = {}) => {
    const { onComplete = () => {}, useNativeDriver = false } = options;

    const isExpanding = toValue > (value._value || 0);

    Animated.timing(value, {
      toValue,
      duration: isExpanding ? theme.animations.duration.standard : theme.animations.duration.quick,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    }).start(onComplete);
  }, []);

  const spring = useCallback((value, toValue, options = {}) => {
    const { onComplete = () => {}, useNativeDriver = false } = options;

    Animated.spring(value, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver,
    }).start(onComplete);
  }, []);

  const createValue = useCallback((initial = 0) => {
    const index = valueCursorRef.current;
    valueCursorRef.current += 1;
    if (!valuePoolRef.current[index]) valuePoolRef.current[index] = new Animated.Value(initial);
    return valuePoolRef.current[index];
  }, []);

  return {
    animateLayout,
    animateValue,
    spring,
    createValue,
    duration: theme.animations.duration,
  };
};
