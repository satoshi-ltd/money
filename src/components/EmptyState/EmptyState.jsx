import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './EmptyState.style';
import { useApp } from '../../contexts';
import { Button, Icon, Text, View } from '../../primitives';

const EmptyState = ({ action, caption, icon, onAction, title, variant = 'primary' }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={style.container}>
      <View style={style.well}>
        <Icon name={icon} size="xl" tone="muted" />
      </View>

      <Text bold size="l" style={style.title}>
        {title}
      </Text>
      {caption ? (
        <Text align="center" size="s" tone="muted" style={style.caption}>
          {caption}
        </Text>
      ) : null}

      {onAction && action ? (
        <Button style={style.action} variant={variant} onPress={onAction}>
          {action}
        </Button>
      ) : null}
    </View>
  );
};

EmptyState.propTypes = {
  action: PropTypes.string,
  caption: PropTypes.string,
  icon: PropTypes.string.isRequired,
  onAction: PropTypes.func,
  title: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'outlined']),
};

export { EmptyState };
