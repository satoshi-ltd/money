import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Icon, Pressable } from '../../primitives';
import { theme } from '../../theme';
import { iconButtonSize } from '../../theme/layout';

const IconButton = ({ icon, onPress, style, tone }) => {
  const { colors } = useApp();

  return (
    <Pressable onPress={onPress} style={[styles.container, { borderColor: colors.border }, style]}>
      <Icon name={icon} size="m" tone={tone} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
    borderWidth: theme.hairline,
    height: iconButtonSize,
    justifyContent: 'center',
    width: iconButtonSize,
  },
});

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  style: PropTypes.any,
  tone: PropTypes.string,
};

export { IconButton };
