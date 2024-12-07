import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Heading.style';

const Heading = ({ children, value = '', ...others }) => (
  <View {...others} row spaceBetween style={[style.heading, others.style]}>
    <Text bold secondary subtitle>
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
