import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Heading.style';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';
import { Eyebrow } from '../Eyebrow';

const Heading = ({ children, eyebrow, offset, value = '', ...others }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View {...others} style={[offset && styles.offset, others.style]}>
      <View row spaceBetween style={styles.heading}>
        <Text bold size="l">
          {value}
        </Text>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {children ? (
          <View row style={styles.actions}>
            {children}
          </View>
        ) : null}
      </View>
    </View>
  );
};

Heading.propTypes = {
  children: PropTypes.node,
  eyebrow: PropTypes.string,
  offset: PropTypes.bool,
  value: PropTypes.string,
};

export { Heading };
