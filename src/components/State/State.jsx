import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';
import { theme } from '../../theme';

const State = ({ title, caption, icon, children }) => {
  const { colors } = useApp();
  const dynamic = useMemo(() => StyleSheet.create({ bg: { backgroundColor: colors.surface } }), [colors.surface]);

  return (
    <View style={[styles.container, dynamic.bg]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text bold size="l">
        {title}
      </Text>
      {caption ? (
        <Text tone="secondary" size="s">
          {caption}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
});

State.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node,
};

export default State;
