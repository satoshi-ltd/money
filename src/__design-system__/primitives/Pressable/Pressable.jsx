import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Platform, Keyboard, Pressable as PressableBase, View as ViewBase } from 'react-native';

import { style } from './Pressable.style';

const Pressable = ({ children, feedback = true, onPress, ...others }) => {
  // const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  // ! TODO: Not sure this is mandatory
  // useEffect(() => {
  //   const IOS = Platform.OS === 'ios';

  //   const showEvent = IOS ? 'keyboardWillShow' : 'keyboardDidShow';
  //   const hideEvent = IOS ? 'keyboardWillHide' : 'keyboardDidHide';
  //   const handleShow = () => setKeyboardOpen(true);
  //   const handleHide = () => setKeyboardOpen(false);

  //   Keyboard.addListener(showEvent, handleShow);
  //   Keyboard.addListener(hideEvent, handleHide);

  //   return () => {
  //     Keyboard.removeListener(showEvent, handleShow);
  //     Keyboard.removeListener(hideEvent, handleHide);
  //   };
  // }, []);

  const handlePress = (event) => {
    // Platform.OS !== 'web' && isKeyboardOpen && Keyboard.dismiss();
    onPress && onPress(event);
  };

  return (
    <PressableBase
      {...others}
      pointerEvents={onPress ? others.pointerEvents : 'none'}
      onPress={handlePress}
      style={[style.container, others.style]}
    >
      {({ pressed }) => (
        <>
          {children}
          {feedback && pressed && <ViewBase pointerEvents="none" style={style.overflow} />}
        </>
      )}
    </PressableBase>
  );
};

Pressable.displayName = 'Pressable';

Pressable.propTypes = {
  children: PropTypes.node,
  feedback: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Pressable };
