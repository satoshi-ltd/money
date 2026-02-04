import { Animated, Dimensions, KeyboardAvoidingView, Modal as RNModal, Platform } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { Pressable, View } from '../../primitives';
import { styles } from './Modal.styles';

const Modal = ({ children, onClose }) => {
  const [visible, setVisible] = useState(true);
  const isFocused = useIsFocused();
  const isAndroid = Platform.OS === 'android';
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (!isFocused) return;
    setVisible(true);
    translateY.setValue(screenHeight);
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleClose = () => {
    if (!onClose) return;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setVisible(false);
      onClose();
    });
  };

  if (!visible || !isFocused) return null;

  const handleGestureEvent = (event) => {
    const { translationY } = event.nativeEvent;
    translateY.setValue(Math.max(0, translationY));
  };

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (!onClose) return;
    const { translationY, velocityY, state } = nativeEvent;
    if (state !== State.END) return;
    if (translationY > 120 || velocityY > 800) {
      handleClose();
      return;
    }
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const gestureEnabled = useMemo(() => !!onClose, [onClose]);

  return (
    <RNModal
      transparent
      animationType="none"
      visible={visible && isFocused}
      onRequestClose={onClose ? handleClose : undefined}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdropPressable} onPress={handleClose} />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={isAndroid ? 'height' : 'padding'}
          style={styles.keyboardAvoid}
        >
          <PanGestureHandler
            enabled={gestureEnabled}
            activeOffsetY={10}
            failOffsetX={[-30, 30]}
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleGestureStateChange}
          >
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
              <SafeAreaView edges={['bottom']} style={styles.container}>
                <View style={styles.handle} />
                <View style={styles.content}>{children}</View>
              </SafeAreaView>
            </Animated.View>
          </PanGestureHandler>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

export default Modal;

Modal.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
};
