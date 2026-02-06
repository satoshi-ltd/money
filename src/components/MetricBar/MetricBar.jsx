import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { getStyles } from './MetricBar.style';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';

const resolveBarColor = (value, colors) => {
  if (!value) return colors.accent;
  if (value === 'accent') return colors.accent;
  if (value === 'content') return colors.text;
  if (value === 'contentLight' || value === 'secondary') return colors.textSecondary;
  if (value === 'border') return colors.border;
  if (value === 'danger' || value === 'error') return colors.danger;
  if (value === 'warning') return colors.warning;
  return value;
};

const MetricBar = ({ color = 'accent', minPercent = 6, percent = 0, title, value, style: propStyle }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const clamped = Math.max(0, Math.min(100, percent));
  const width = `${Math.max(minPercent, Math.round(clamped))}%`;

  const fillColor = resolveBarColor(color, colors);
  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        fill: {
          width,
          backgroundColor: fillColor,
        },
      }),
    [fillColor, width],
  );

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
        <View style={[style.fill, dynamic.fill]} />
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
