import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { Text, View } from '../../design-system';

const Pill = ({ text, color = 'surface', style }) => {
  const { colors } = useApp();
  const backgroundColor = colors[color] || colors.surface;

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text size="s">{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});

Pill.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  style: PropTypes.any,
};

export default Pill;
