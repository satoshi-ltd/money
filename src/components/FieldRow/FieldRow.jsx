import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './FieldRow.style';
import { useApp } from '../../contexts';
import { ICON } from '../../modules';
import { Icon, Pressable, Text, View } from '../../primitives';

const FieldRow = ({ chevron = false, children, divider = false, label, onPress }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const Container = onPress ? Pressable : View;

  return (
    <Container style={[style.row, divider && style.divider]} onPress={onPress}>
      <Text size="s" style={style.label} tone="muted">
        {label}
      </Text>
      <View row style={style.value}>
        {children}
      </View>
      {chevron ? <Icon name={ICON.DOWN} size="s" tone="muted" /> : null}
    </Container>
  );
};

FieldRow.displayName = 'FieldRow';

FieldRow.propTypes = {
  chevron: PropTypes.bool,
  children: PropTypes.node,
  divider: PropTypes.bool,
  label: PropTypes.string,
  onPress: PropTypes.func,
};

export { FieldRow };
