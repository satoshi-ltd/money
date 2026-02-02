import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable as RNPressable, View as RNView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import { Icon, Pressable, ScrollView, Text, View } from '../../design-system';
import { ICON } from '../../modules';
import { styles } from './Modal.styles';

const Modal = ({ children, gap, onClose, style, title }) => {
  const [visible, setVisible] = useState(true);
  const isFocused = useIsFocused();
  const isAndroid = Platform.OS === 'android';
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!isFocused) return;
    setVisible(true);
  }, [isFocused]);

  const containerStyle = useMemo(
    () => [styles.container, gap ? styles.gap : null, style, !isAndroid ? { paddingBottom: 0 } : null],
    [gap, isAndroid, style],
  );
  const scrollContentStyle = useMemo(() => [styles.scrollContent, { paddingBottom: bottom }], [bottom]);

  const handleClose = () => {
    if (!onClose) return;
    setVisible(false);
    onClose();
  };

  if (!visible || !isFocused) return null;

  return (
    <RNModal
      transparent
      animationType="fade"
      visible={visible && isFocused}
      onRequestClose={onClose ? handleClose : undefined}
    >
      <RNView style={styles.overlay}>
        <RNPressable style={{ flex: 1 }} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={isAndroid ? 'height' : 'padding'}
          keyboardVerticalOffset={top}
          style={{ justifyContent: 'flex-end' }}
        >
          <RNView style={styles.sheet}>
            <SafeAreaView edges={['bottom']} style={containerStyle}>
              <View style={styles.handle} />
              {(title || onClose) && (
                <View style={styles.header}>
                  <Text bold subtitle style={styles.title}>
                    {title}
                  </Text>
                  {onClose ? (
                    <Pressable onPress={handleClose} style={styles.close}>
                      <Icon name={ICON.CLOSE} />
                    </Pressable>
                  ) : null}
                </View>
              )}
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={scrollContentStyle}>
                {children}
              </ScrollView>
            </SafeAreaView>
          </RNView>
        </KeyboardAvoidingView>
      </RNView>
    </RNModal>
  );
};

export default Modal;
