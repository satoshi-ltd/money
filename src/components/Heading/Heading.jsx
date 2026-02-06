import PropTypes from 'prop-types';
import React from 'react';

import { styles } from './Heading.style';
import { Text, View } from '../../primitives';

const Heading = ({ children, offset, value = '', ...others }) => (
  <View {...others} row spaceBetween style={[styles.heading, offset && styles.offset, others.style]}>
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
