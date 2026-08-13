import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { L10N } from '../../modules';
import { Button, Text, View } from '../../primitives';
import { theme } from '../../theme';
import { viewOffset } from '../../theme/layout';

const getStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: viewOffset,
      gap: theme.spacing.sm,
    },
    detail: {
      marginBottom: theme.spacing.sm,
    },
  });

const Fallback = ({ error, onRetry }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <Text bold size="l">
        {L10N.ERROR}
      </Text>
      <Text size="s" tone="secondary" style={styles.detail}>
        {`${error?.message || error || ''}`}
      </Text>
      <Button onPress={onRetry}>{L10N.ERROR_TRY_AGAIN}</Button>
    </View>
  );
};

Fallback.propTypes = {
  error: PropTypes.any,
  onRetry: PropTypes.func,
};

export { Fallback };
