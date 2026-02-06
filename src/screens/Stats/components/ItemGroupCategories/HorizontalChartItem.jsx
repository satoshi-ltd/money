import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './HorizontalChartItem.style';
import { MetricBar, PriceFriendly, View } from '../../../../components';
import { useApp } from '../../../../contexts';

const capitalizeFirst = (value = '') => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
};

const HorizontalChartItem = ({ color, currency, detail, title, value, width: propWidth = 0 }) => {
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const valueTextProps = {
    bold: !detail,
    tone: detail ? 'secondary' : 'primary',
    size: detail ? 'xs' : 's',
  };

  const valueNode = <PriceFriendly {...valueTextProps} currency={currency} fixed={0} value={value} />;

  const barColor = color || 'contentLight';
  const titleLabel = capitalizeFirst(title);

  return (
    <View style={detail ? style.detail : undefined}>
      <MetricBar
        color={barColor}
        minPercent={detail ? 0 : 6}
        percent={propWidth}
        title={titleLabel}
        value={valueNode}
        variant={detail ? 'kpi' : 'stats'}
        style={detail ? style.detailItem : style.item}
      />
    </View>
  );
};

HorizontalChartItem.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  detail: PropTypes.bool,
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.number,
};

export { HorizontalChartItem };
