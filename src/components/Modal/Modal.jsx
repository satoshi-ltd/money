import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Animated, KeyboardAvoidingView, Modal as RNModal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { Pressable, View } from '../../design-system';
import { styles } from './Modal.styles';

const Modal = ({ children, onClose }) => {
  const [visible, setVisible] = useState(true);
  const isFocused = useIsFocused();
  const isAndroid = Platform.OS === 'android';
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFocused) return;
    setVisible(true);
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handleClose = () => {
    if (!onClose) return;
    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onClose();
    });
  };

  if (!visible || !isFocused) return null;

  return (
    <RNModal
      transparent
      animationType="slide"
      visible={visible && isFocused}
      onRequestClose={onClose ? handleClose : undefined}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={isAndroid ? 'height' : 'padding'}
          style={{ justifyContent: 'flex-end' }}
        >
          <View style={styles.sheet}>
            <SafeAreaView edges={['bottom']} style={styles.container}>
              <Pressable onPress={handleClose} style={styles.handle} />
              {children}
            </SafeAreaView>
          </View>
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
