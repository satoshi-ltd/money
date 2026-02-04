import PropTypes from 'prop-types';
import React from 'react';

import { Text, View } from '../../primitives';
import { resolveColor } from '../utils/resolveColor';
import { style } from './MetricBar.style';

const MetricBar = ({
  color = 'accent',
  minPercent = 6,
  percent = 0,
  title,
  value,
  style: propStyle,
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const width = `${Math.max(minPercent, Math.round(clamped))}%`;

  const fillColor = resolveColor(color, color);

  return (
    <View style={[style.container, propStyle]}>
      {title || value ? (
        <View style={style.header}>
          {title ? (
            <Text tone="primary" size="xs">
              {title}
            </Text>
          ) : null}
          {value !== undefined && value !== null ? (
            typeof value === 'string' || typeof value === 'number' ? (
              <Text tone="secondary" size="xs">
                {value}
              </Text>
            ) : (
              value
            )
          ) : null}
        </View>
      ) : null}
      <View style={style.track}>
        <View style={[style.fill, { width, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
};

MetricBar.propTypes = {
  color: PropTypes.string,
  minPercent: PropTypes.number,
  percent: PropTypes.number,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  style: PropTypes.any,
};

export default MetricBar;
