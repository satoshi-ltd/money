import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Checkbox.style';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, View } from '../../primitives';

const Checkbox = ({ checked = false, onPress, style: styleContainer }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const Container = typeof onPress === 'function' ? Pressable : View;

  return (
    <Container onPress={onPress} style={[style.box, checked && style.checked, styleContainer]}>
      {checked ? <Icon name={ICON.CHECK} size="xxs" tone="onAccent" /> : null}
    </Container>
  );
};

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onPress: PropTypes.func,
  style: PropTypes.any,
};

export { Checkbox };
