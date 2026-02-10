import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Chip.styles';
import { useApp } from '../../contexts';
import { Icon, Pressable, Text, View } from '../../primitives';

const Chip = ({ icon, label, onPress, shape = 'pill', size = 'xs', style, variant = 'muted' }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isPressable = typeof onPress === 'function';
  const Container = isPressable ? Pressable : View;

  const variantStyle =
    variant === 'accent'
      ? styles.variantAccent
      : variant === 'outline'
      ? styles.variantOutline
      : variant === 'inverse'
      ? styles.variantInverse
      : styles.variantMuted;

  const sizeStyle = size === 's' ? styles.sizeS : styles.sizeXS;
  const shapeStyle = shape === 'circle' ? styles.shapeCircle : styles.shapePill;

  const contentTone =
    variant === 'accent' ? 'onAccent' : variant === 'inverse' ? 'onInverse' : variant === 'outline' ? 'secondary' : 'secondary';

  return (
    <Container
      disabled={!isPressable ? undefined : false}
      onPress={onPress}
      style={[styles.base, variantStyle, sizeStyle, shapeStyle, style]}
    >
      {icon ? <Icon name={icon} tone={contentTone} size="xxs" /> : null}
      <Text bold size="xs" tone={contentTone}>
        {label}
      </Text>
    </Container>
  );
};

Chip.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onPress: PropTypes.func,
  shape: PropTypes.oneOf(['pill', 'circle']),
  size: PropTypes.oneOf(['xs', 's']),
  style: PropTypes.any,
  variant: PropTypes.oneOf(['muted', 'accent', 'outline', 'inverse']),
};

export default Chip;
