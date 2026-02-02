import { useRef, useCallback } from 'react';
import { Animated, LayoutAnimation, Easing, Platform, UIManager } from 'react-native';

import { theme } from '../config/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export const useMotion = () => {
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
    return useRef(new Animated.Value(initial)).current;
  }, []);

  return {
    animateLayout,
    animateValue,
    spring,
    createValue,
    duration: theme.animations.duration,
  };
};
