import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './HorizontalChartItem.style';
import { PriceFriendly, Text, View } from '../../../../components';
import { useApp } from '../../../../contexts';
import { compactFigure, L10N, percentText } from '../../../../modules';

const capitalizeFirst = (value = '') => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const HorizontalChartItem = ({ budget, color, currency, title, value, width: propWidth = 0 }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const fill = budget ? { near: colors.accent, over: colors.danger, within: colors.text }[budget.state] : color;
  const width = budget ? Math.min(100, Math.round((budget.spent * 100) / budget.total)) : propWidth;
  const note = budget
    ? budget.over > 0
      ? `+${compactFigure(budget.over)}`
      : L10N.BUDGET_OF(compactFigure(budget.total))
    : percentText(Math.round(propWidth));

  return (
    <View row style={style.row}>
      <View style={[style.dot, { backgroundColor: color }]} />
      <Text flex numberOfLines={1} size="s">
        {capitalizeFirst(title)}
      </Text>
      <View style={[style.track, { backgroundColor: colors.surface }]}>
        <View style={[style.fill, { backgroundColor: fill, width: `${Math.max(2, width)}%` }]} />
      </View>
      <Text align="right" figure="xs" numberOfLines={1} style={style.percent} tone={budget?.over > 0 ? 'danger' : 'muted'}>
        {note}
      </Text>
      <View style={style.amount}>
        <PriceFriendly bold currency={currency} fixed={0} size="md" tone={budget?.over > 0 ? 'danger' : undefined} value={value} />
      </View>
    </View>
  );
};

HorizontalChartItem.propTypes = {
  budget: PropTypes.shape({ over: PropTypes.number, spent: PropTypes.number, state: PropTypes.string, total: PropTypes.number }),
  color: PropTypes.string,
  currency: PropTypes.string,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
