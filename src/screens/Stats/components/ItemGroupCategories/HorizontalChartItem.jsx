import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './HorizontalChartItem.style';
import { PriceFriendly, Text, View } from '../../../../components';
import { useApp } from '../../../../contexts';
import { percentText } from '../../../../modules';

const capitalizeFirst = (value = '') => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const HorizontalChartItem = ({ color, currency, title, value, width: propWidth = 0 }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  return (
    <View row style={style.row}>
      <View style={[style.dot, { backgroundColor: color }]} />
      <Text flex numberOfLines={1} size="s">
        {capitalizeFirst(title)}
      </Text>
      <View style={[style.track, { backgroundColor: colors.surface }]}>
        <View style={[style.fill, { backgroundColor: color, width: `${Math.max(2, propWidth)}%` }]} />
      </View>
      <Text align="right" figure="xs" style={style.percent} tone="muted">
        {percentText(Math.round(propWidth))}
      </Text>
      <View style={style.amount}>
        <PriceFriendly bold currency={currency} fixed={0} size="md" value={value} />
      </View>
    </View>
  );
};

HorizontalChartItem.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
