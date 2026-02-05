import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Icon, Pressable, Text, View } from '../../primitives';
import { theme } from '../../theme';

const Checkbox = ({ checked, label, onChange, disabled }) => {
  const { colors } = useApp();
  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        box: {
          borderColor: colors.border,
          backgroundColor: checked ? colors.accent : 'transparent',
        },
      }),
    [checked, colors.accent, colors.border],
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[styles.container, disabled && styles.disabled]}
    >
      <View style={[styles.box, dynamic.box]}>{checked ? <Icon name="check" tone="onAccent" /> : null}</View>
      {label ? <Text>{label}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  box: {
    width: theme.spacing.md + theme.spacing.xs,
    height: theme.spacing.md + theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: theme.spacing.xs / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

Checkbox.propTypes = {
  checked: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default Checkbox;
