import React from 'react';
import { ActivityIndicator } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import Icon from '../Icon';
import Pressable from '../Pressable';
import Text from '../Text';
import { resolveColor } from '../../components/utils/resolveColor';
import { styles } from './Button.styles';

const Button = ({
  activity,
  children,
  disabled,
  flex,
  icon,
  large,
  onPress,
  outlined,
  secondary,
  small,
  rounded,
  style,
  ...props
}) => {
  const isDisabled = disabled || activity;
  const iconOnly = !!icon && !children;

  const textColor = outlined
    ? resolveColor('content')
    : secondary
      ? StyleSheet.value('$buttonChildrenColorSecondary') || resolveColor('base')
      : resolveColor('content');

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        small && styles.small,
        large && styles.large,
        iconOnly && styles.iconOnly,
        iconOnly && small && styles.iconOnlySmall,
        iconOnly && large && styles.iconOnlyLarge,
        outlined ? styles.outlined : secondary ? styles.secondary : styles.primary,
        rounded ? styles.rounded : null,
        flex ? { flex: typeof flex === 'number' ? flex : 1 } : null,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {activity ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} color={textColor} small={small} subtitle={!small && !large} title={large} /> : null}
          {children ? (
            <Text bold caption={small} color={textColor}>
              {children}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

export default Button;
