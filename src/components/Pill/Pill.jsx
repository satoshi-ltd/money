import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';
import { theme } from '../../theme';

const Pill = ({ text, color = 'surface', style }) => {
  const { colors } = useApp();
  const backgroundColor = colors[color] || colors.surface;
  const dynamic = useMemo(() => StyleSheet.create({ bg: { backgroundColor } }), [backgroundColor]);

  return (
    <View style={[styles.container, dynamic.bg, style]}>
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
