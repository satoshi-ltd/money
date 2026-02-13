import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { getStyles } from './MetricBar.style';
import { useApp } from '../../contexts';
import { Text, View } from '../../primitives';
import { theme } from '../../theme';

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

const MetricBar = ({
  color = 'accent',
  fillStyle,
  minPercent = 6,
  percent = 0,
  secondaryPercent = 0,
  secondaryOpacity = 0.45,
  title,
  trackStyle,
  value,
  variant = 'kpi',
  style: propStyle,
}) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const isStats = variant === 'stats';
  const clamped = Math.max(0, Math.min(100, percent));
  const clampedSecondary = Math.max(0, Math.min(100, secondaryPercent));
  const width = `${Math.max(minPercent, Math.round(clamped))}%`;
  const hasSecondary = clampedSecondary > 0;

  const scaledSegments = useMemo(() => {
    const total = clamped + clampedSecondary;
    if (!hasSecondary || total <= 0) return { primary: clamped, secondary: 0 };
    if (total <= 100) return { primary: clamped, secondary: clampedSecondary };
    const ratio = 100 / total;
    return { primary: clamped * ratio, secondary: clampedSecondary * ratio };
  }, [clamped, clampedSecondary, hasSecondary]);

  const fillColor = resolveBarColor(color, colors);
  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        fill: {
          width,
          backgroundColor: fillColor,
        },
        fillPrimary: {
          width: `${scaledSegments.primary}%`,
          backgroundColor: fillColor,
        },
        fillSecondary: {
          width: `${scaledSegments.secondary}%`,
          backgroundColor: fillColor,
          opacity: secondaryOpacity,
        },
      }),
    [fillColor, scaledSegments.primary, scaledSegments.secondary, secondaryOpacity, width],
  );

  const dynamicContainer = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: isStats ? theme.spacing.xxs / 2 : theme.spacing.xxs / 2,
        },
        track: {
          height: isStats ? theme.spacing.xxs + 2 : theme.spacing.xxs,
        },
      }),
    [isStats],
  );

  const headerSize = isStats ? 's' : 'xs';

  return (
    <View style={[style.container, dynamicContainer.container, propStyle]}>
      {title || value ? (
        <View style={style.header}>
          {title ? (
            typeof title === 'string' || typeof title === 'number' ? (
              <Text bold={isStats} tone="primary" size={headerSize}>
                {title}
              </Text>
            ) : (
              title
            )
          ) : null}
          {value !== undefined && value !== null ? (
            typeof value === 'string' || typeof value === 'number' ? (
              <Text tone="secondary" size={headerSize}>
                {value}
              </Text>
            ) : (
              value
            )
          ) : null}
        </View>
      ) : null}
      <View style={[style.track, dynamicContainer.track, trackStyle]}>
        {hasSecondary ? (
          <View row style={style.segments}>
            <View style={[style.fill, dynamic.fillPrimary, fillStyle]} />
            <View style={[style.fill, dynamic.fillSecondary, fillStyle]} />
          </View>
        ) : (
          <View style={[style.fill, dynamic.fill, fillStyle]} />
        )}
      </View>
    </View>
  );
};

MetricBar.propTypes = {
  color: PropTypes.string,
  fillStyle: PropTypes.any,
  minPercent: PropTypes.number,
  percent: PropTypes.number,
  secondaryPercent: PropTypes.number,
  secondaryOpacity: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  trackStyle: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  variant: PropTypes.oneOf(['kpi', 'stats']),
  style: PropTypes.any,
};

export default MetricBar;
