import { Text, View } from '@satoshi-ltd/nano-design';
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
  currency,
  fixed,
  highlight,
  label,
  maskAmount,
  operator,
  value = 0,
  ...others
}) => {
  const { settings = {} } = useStore();

  const maskedAmount = maskAmount !== undefined ? maskAmount : settings.maskAmount;
  const operatorEnhanced = (operator && parseFloat(value, 10) !== 0) || value < 0 ? (value > 0 ? '+' : '-') : undefined;
  const symbol = SYMBOL[currency] || currency;

  const symbolProps = {
    ...others,
    bold,
    children: symbol,
    style: [style.symbol, others.style],
  };

  const formatedValue = format({
    fixed: fixed !== undefined ? fixed : currencyDecimals(value, currency),
    mask: maskedAmount,
    numberOfLines: 1,
    value: Math.abs(value),
    style: [others.style],
  });

  return (
    <View row style={[style.container, highlight && !maskAmount && style.highlight]}>
      {label && <Text {...others}>{label}</Text>}
      {maskedAmount ? (
        <Text {...others} bold={bold}>
          {formatedValue}
        </Text>
      ) : (
        <>
          {operatorEnhanced && <Text {...others}>{operatorEnhanced}</Text>}
          {LEFT_SYMBOLS.includes(symbol) && <Text {...symbolProps} />}
          <Text {...others} {...{ bold }}>
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
  currency: PropTypes.string,
  fixed: PropTypes.number,
  highlight: PropTypes.bool,
  label: PropTypes.string,
  maskAmount: PropTypes.bool,
  operator: PropTypes.bool,
  value: PropTypes.number,
};

export { PriceFriendly };
