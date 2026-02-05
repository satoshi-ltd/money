import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Field.style';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';

const Field = ({ children, first, focused, label, last, style: styleProp, suffix, ...props }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View
      {...props}
      style={[
        styles.container,
        first ? styles.first : null,
        !last ? styles.noBottom : null,
        last ? styles.last : null,
        focused ? styles.focus : null,
        styleProp,
      ]}
    >
      {label ? (
        <Text tone={!focused ? 'secondary' : 'primary'} pointerEvents="none" style={styles.label} size="s">
          {label}
        </Text>
      ) : null}
      {suffix ? (
        <View row align="center" style={styles.content}>
          <View flex>{children}</View>
          <View style={styles.suffix}>{suffix}</View>
        </View>
      ) : (
        children
      )}
    </View>
  );
};

Field.propTypes = {
  children: PropTypes.node,
  first: PropTypes.bool,
  focused: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  suffix: PropTypes.node,
  style: PropTypes.any,
};

export { Field };
