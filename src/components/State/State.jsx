import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';

import { theme } from '../../config/theme';
import { useApp } from '../../contexts';
import { Text, View } from '../../design-system';

const State = ({ title, caption, icon, children }) => {
  const { colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text bold subtitle>
        {title}
      </Text>
      {caption ? (
        <Text caption color="contentLight">
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
