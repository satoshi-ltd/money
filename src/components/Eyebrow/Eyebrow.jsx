import PropTypes from 'prop-types';
import React from 'react';

import { Text } from '../../primitives';

// The small uppercase label that names a block; one place, so 29 of them cannot drift apart again.
const Eyebrow = ({ children, style, tone = 'muted' }) => (
  <Text bold numberOfLines={1} size="xxs" style={style} tone={tone} uppercase>
    {children}
  </Text>
);

Eyebrow.displayName = 'Eyebrow';

Eyebrow.propTypes = {
  children: PropTypes.node,
  style: PropTypes.any,
  tone: PropTypes.string,
};

export { Eyebrow };
