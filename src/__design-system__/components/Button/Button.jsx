import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './Button.style';
import { Pressable, Text } from '../../primitives';

const Button = ({
  activity = false,
  children,
  disabled,
  flex = false,
  outlined = false,
  secondary = false,
  small = false,
  onPress = () => {},
  ...others
}) => (
  <Pressable
    disabled={disabled}
    feedback
    onPress={!disabled && !activity ? onPress : undefined}
    style={[
      style.button,
      disabled ? style.disabled : secondary ? style.secondary : outlined ? style.outlined : style.primary,
      flex && style.flex,
      small && style.small,
      others.style,
    ]}
  >
    {!activity ? (
      <Text
        bold
        caption={small}
        color={disabled ? 'disabled' : secondary || outlined ? 'content' : 'base'}
        style={style.text}
      >
        {children}
      </Text>
    ) : (
      <ActivityIndicator
        size="small"
        color={StyleSheet.value(secondary || outlined ? '$colorContent' : '$colorBase')}
      />
    )}
  </Pressable>
);

Button.displayName = 'Button';

Button.propTypes = {
  activity: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  flex: PropTypes.bool,
  outlined: PropTypes.bool,
  secondary: PropTypes.bool,
  small: PropTypes.bool,
  onPress: PropTypes.func,
};

export { Button };
