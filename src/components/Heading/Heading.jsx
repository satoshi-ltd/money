import { Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Heading.style';

const Heading = ({ children, offset, value = '', ...others }) => (
  <View {...others} row spaceBetween style={[style.heading, offset && style.offset, others.style]}>
    <Text bold size="l">
      {value}
    </Text>
    {children && <View row>{children}</View>}
  </View>
);

Heading.propTypes = {
  children: PropTypes.node,
  offset: PropTypes.bool,
  value: PropTypes.string,
};

export { Heading };
