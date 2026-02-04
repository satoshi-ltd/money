import React from 'react';
import { ActivityIndicator } from 'react-native';

import Icon from '../Icon';
import Pressable from '../Pressable';
import Text from '../Text';
import { resolveColor } from '../../components/utils/resolveColor';
import { styles } from './Button.styles';

const Button = ({
  children,
  disabled,
  grow,
  icon,
  loading,
  onPress,
  size,
  style,
  variant,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const iconOnly = !!icon && !children;

  const resolvedVariant = variant || 'primary';
  const resolvedSize = size || 'm';

  const textColor = isDisabled
    ? resolveColor('contentLight')
    : resolvedVariant === 'secondary'
      ? resolveColor('base')
      : resolveColor('content');

  const sizeStyle = resolvedSize === 's' ? styles.small : resolvedSize === 'l' ? styles.large : null;
  const iconSizeStyle =
    iconOnly && resolvedSize === 's'
      ? styles.iconOnlySmall
      : iconOnly && resolvedSize === 'l'
        ? styles.iconOnlyLarge
        : iconOnly
          ? styles.iconOnly
          : null;

  const variantStyle =
    resolvedVariant === 'outlined'
      ? styles.outlined
      : resolvedVariant === 'secondary'
        ? styles.secondary
        : resolvedVariant === 'ghost'
          ? styles.ghost
          : styles.primary;

  const disabledVariantStyle =
    isDisabled && resolvedVariant === 'outlined'
      ? styles.disabledOutlined
      : isDisabled && resolvedVariant === 'secondary'
        ? styles.disabledSecondary
        : isDisabled && resolvedVariant === 'ghost'
          ? styles.disabledGhost
          : isDisabled
            ? styles.disabledPrimary
            : null;

  const iconSize =
    resolvedSize === 's'
      ? 'xs'
      : resolvedSize === 'm'
        ? 'l'
        : 'xl';

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        iconOnly && styles.iconOnly,
        iconSizeStyle,
        variantStyle,
        grow && styles.grow,
        disabledVariantStyle,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} color={textColor} size={iconSize} /> : null}
          {children ? (
            <Text bold size={resolvedSize === 's' ? 's' : 'm'} color={textColor}>
              {children}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

export default Button;
