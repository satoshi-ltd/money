import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Heading.style';
import { Text, View } from '../../__design-system__';

const Heading = ({ children, value = '', ...others }) => (
  <View {...others} row spaceBetween style={[style.heading, others.style]}>
    <Text bold subtitle>
      {value}
    </Text>
    {children && <View row>{children}</View>}
  </View>
);

Heading.propTypes = {
  children: PropTypes.node,
  value: PropTypes.string,
};

export { Heading };
