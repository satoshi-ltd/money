import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, useWindowDimensions } from 'react-native';

import { style } from './Modal.style';
import { Icon, Pressable, View } from '../../primitives';

const presentation = 'transparentModal';

const Modal = ({ fullscreen = false, onClose, ...others }) => {
  const { height: windowHeight } = useWindowDimensions();

  const [layoutHeight, setLayoutHeight] = useState(0);

  return presentation === 'transparentModal' ? (
    <View style={style.overflow}>
      <SafeAreaView
        onLayout={({ nativeEvent: { layout = {} } = {} }) => {
          if (layout.height) setLayoutHeight(layout.height);
        }}
        style={[style.safeAreaView, fullscreen && style.fullscreen]}
      >
        {onClose && (
          <Pressable onPress={onClose} style={style.pressableClose}>
            <Icon name="chevron-down" title />
          </Pressable>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={windowHeight - layoutHeight}
        >
          <View {...others} style={[style.content, onClose && style.contentModal, others.style]} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  ) : (
    <SafeAreaView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View {...others} style={[style.content, others.style]} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

Modal.displayName = 'Modal';

Modal.propTypes = {
  children: PropTypes.node,
  fullscreen: PropTypes.bool,
  gap: PropTypes.bool,
  onClose: PropTypes.func,
};

export { Modal };
