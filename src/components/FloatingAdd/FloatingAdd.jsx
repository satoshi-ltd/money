import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { useMotion } from '../../hooks/useMotion';
import { ICON } from '../../modules';
import { Icon, Pressable } from '../../primitives';
import { theme } from '../../theme';
import { sealSize } from '../../theme/layout';

const FloatingAdd = ({ onPress }) => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useApp();
  const { createValue, spring } = useMotion();

  const enter = createValue(0);

  // It waits out the push transition and then springs in, so it arrives instead of being already there.
  useEffect(() => {
    const timer = setTimeout(() => spring(enter, 1, { useNativeDriver: true }), theme.animations.duration.standard);
    return () => clearTimeout(timer);
  }, [enter, spring]);

  return (
    <Animated.View
      style={[
        styles.seal,
        { backgroundColor: colors.inverse, bottom: bottom + theme.spacing.xs },
        { opacity: enter, transform: [{ scale: enter }] },
      ]}
    >
      <Pressable style={styles.press} testID="floating-add" onPress={onPress}>
        <Icon name={ICON.ADD} size="l" tone="onInverse" />
      </Pressable>
    </Animated.View>
  );
};

// Same seal, same place as the one in the tab bar: on a pushed screen it reads as that button following you.
const styles = StyleSheet.create({
  seal: {
    alignSelf: 'center',
    borderRadius: theme.borderRadius.sm,
    height: sealSize,
    position: 'absolute',
    width: sealSize,
    ...theme.shadows.overlay,
  },
  press: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

FloatingAdd.displayName = 'FloatingAdd';

FloatingAdd.propTypes = {
  onPress: PropTypes.func,
};

export { FloatingAdd };
