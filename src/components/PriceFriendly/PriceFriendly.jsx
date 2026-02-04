import { Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React from 'react';

import { format } from './helpers';
import { style } from './PriceFriendly.style';
import { useStore } from '../../contexts';
import { C, currencyDecimals } from '../../modules';

const { SYMBOL } = C;

const LEFT_SYMBOLS = ['$', '£'];

const PriceFriendly = ({
  bold = false,
  color,
  currency,
  fixed,
  label,
  maskAmount: propMaskAmount,
  operator,
  tone,
  value = 0,
  ...others
}) => {
  const { settings: { maskAmount } = {} } = useStore();
  const maskedAmount = propMaskAmount || maskAmount;
  const operatorEnhanced = (operator && parseFloat(value, 10) !== 0) || value < 0 ? (value > 0 ? '+' : '-') : undefined;
  const symbol = SYMBOL[currency] || currency;
  const resolvedStyle = color ? [others.style, { color }] : others.style;
  const resolvedTone = color ? undefined : tone;

  const symbolProps = {
    ...others,
    bold,
    tone: resolvedTone,
    children: symbol,
    style: [style.symbol, resolvedStyle],
  };

  const formatedValue = format({
    fixed: fixed !== undefined ? fixed : currencyDecimals(value, currency),
    mask: maskedAmount,
    numberOfLines: 1,
    value: Math.abs(value),
    style: [others.style],
  });

  return (
    <View row style={style.container}>
      {label && (
        <Text {...others} tone={resolvedTone} style={resolvedStyle}>
          {label}
        </Text>
      )}
      {maskedAmount ? (
        <Text {...others} {...{ bold }} tone={resolvedTone} style={resolvedStyle}>
          {formatedValue}
        </Text>
      ) : (
        <>
          {operatorEnhanced && (
            <Text {...others} tone={resolvedTone} style={resolvedStyle}>
              {operatorEnhanced}
            </Text>
          )}
          {LEFT_SYMBOLS.includes(symbol) && <Text {...symbolProps} />}
          <Text {...others} {...{ bold }} tone={resolvedTone} style={resolvedStyle}>
            {formatedValue}
          </Text>
          {!LEFT_SYMBOLS.includes(symbol) && <Text {...symbolProps} />}
        </>
      )}
    </View>
  );
};

PriceFriendly.propTypes = {
  bold: PropTypes.bool,
  color: PropTypes.string,
  currency: PropTypes.string,
  fixed: PropTypes.number,
  label: PropTypes.string,
  maskAmount: PropTypes.bool,
  operator: PropTypes.bool,
  tone: PropTypes.string,
  value: PropTypes.number,
};

export { PriceFriendly };
