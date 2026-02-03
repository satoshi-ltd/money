import { Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Field.style';

const Field = ({ children, first, focused, label, last, style: styleProp, ...props }) => (
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
      <Text caption color={!focused ? 'contentLight' : undefined} pointerEvents="none" style={style.label}>
        {label}
      </Text>
    ) : null}
    {children}
  </View>
);

Field.propTypes = {
  children: PropTypes.node,
  first: PropTypes.bool,
  focused: PropTypes.bool,
  label: PropTypes.string,
  last: PropTypes.bool,
  style: PropTypes.any,
};

export { Field };
