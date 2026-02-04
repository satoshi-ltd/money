import { Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Field.style';

const Field = ({ children, first, focused, label, last, style: styleProp, suffix, ...props }) => (
  <View
    {...props}
    style={[
      style.container,
      first && style.first,
      !last && style.noBottom,
      last && style.last,
      focused && style.focus,
      styleProp,
    ]}
  >
    {label ? (
      <Text
        tone={!focused ? 'secondary' : 'primary'}
        pointerEvents="none"
        style={style.label}
        size="s"
      >
        {label}
      </Text>
    ) : null}
    {suffix ? (
      <View row align="center" style={style.content}>
        <View flex>{children}</View>
        <View style={style.suffix}>{suffix}</View>
      </View>
    ) : (
      children
    )}
  </View>
);

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
