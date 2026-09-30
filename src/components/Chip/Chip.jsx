import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { chipHeight, getStyles } from './Chip.styles';
import { useApp } from '../../contexts';
import { ICON, L10N } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';
import { rowHeight } from '../../theme/layout';

const Chip = ({ icon, iconRight, label, onPress, shape = 'pill', size = 'xs', style, variant = 'muted' }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const isPressable = typeof onPress === 'function';
  const Container = isPressable ? Pressable : View;

  const variantStyle =
    variant === 'accent'
      ? styles.variantAccent
      : variant === 'soft'
      ? styles.variantSoft
      : variant === 'outline'
      ? styles.variantOutline
      : variant === 'inverse'
      ? styles.variantInverse
      : styles.variantMuted;

  const sizeStyle = size === 's' ? styles.sizeS : styles.sizeXS;
  const slop = (rowHeight - chipHeight[size === 's' ? 's' : 'xs']) / 2;
  const shapeStyle = shape === 'circle' ? styles.shapeCircle : styles.shapePill;

  const contentTone =
    variant === 'accent'
      ? 'onAccent'
      : variant === 'soft'
      ? 'onAccentSoft'
      : variant === 'inverse'
      ? 'onInverse'
      : 'secondary';

  return (
    <Container
      accessibilityHint={isPressable && iconRight === ICON.CLOSE ? L10N.A11Y_DISMISS : undefined}
      accessibilityLabel={isPressable ? `${label}` : undefined}
      accessibilityRole={isPressable ? 'button' : undefined}
      disabled={!isPressable ? undefined : false}
      hitSlop={isPressable ? { bottom: slop, left: slop, right: slop, top: slop } : undefined}
      onPress={onPress}
      style={[styles.base, variantStyle, sizeStyle, shapeStyle, style]}
    >
      {icon ? <Icon name={icon} tone={contentTone} size="xxs" /> : null}
      <Text medium tone={contentTone} style={styles.label}>
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} tone={contentTone} size="xxs" /> : null}
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
