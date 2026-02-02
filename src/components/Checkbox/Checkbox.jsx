import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { Icon, Pressable, Text, View } from '../../design-system';

const Checkbox = ({ checked, label, onChange, disabled }) => {
  const { colors } = useApp();

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[styles.container, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          { borderColor: colors.border, backgroundColor: checked ? colors.accent : 'transparent' },
        ]}
      >
        {checked ? <Icon name="check" color="inverse" /> : null}
      </View>
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
