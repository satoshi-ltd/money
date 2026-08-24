import PropTypes from 'prop-types';
import React from 'react';

import { styles } from './PriceFriendly.style';
import { useStore } from '../../contexts';
import { currencyDecimals, currencySymbol, withThinSpace } from '../../modules';
import { Text, View } from '../../primitives';

const MINUS = '−';
const MASK = '••••';

const split = (formatted = '') => {
  const index = formatted.lastIndexOf('.');
  if (index < 0) return [formatted, undefined];
  return [formatted.slice(0, index), formatted.slice(index)];
};

const PriceFriendly = ({
  bold = false,
  color,
  currency,
  fixed,
  label,
  maskAmount: propMaskAmount,
  operator = false,
  showSymbol = false,
  size = 'md',
  tone,
  value = 0,
  ...others
}) => {
  const { settings: { maskAmount } = {} } = useStore();
  const masked = propMaskAmount || maskAmount;

  const decimals = fixed !== undefined ? fixed : currencyDecimals(value, currency);
  const absolute = Math.abs(value);
  const formatted = absolute.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const [whole, cents] = split(formatted);

  const isNegative = value < 0;
  const sign = isNegative ? MINUS : operator && value > 0 ? '+' : '';
  const resolvedTone = tone !== undefined ? tone : operator && value > 0 ? 'positive' : undefined;
  const colorStyle = color ? { color } : undefined;

  const textProps = { ...others, bold, figure: size, tone: resolvedTone, style: [others.style, colorStyle] };

  if (masked) {
    return (
      <Text {...textProps}>
        {label}
        {MASK}
      </Text>
    );
  }

  return (
    <View row style={styles.container}>
      {label ? (
        <Text {...others} figure={size} tone={resolvedTone} style={[others.style, colorStyle]}>
          {label}
        </Text>
      ) : null}
      <Text {...textProps}>
        {`${sign}${whole}`}
        {cents ? (
          <Text {...textProps} tone={resolvedTone === 'positive' ? 'positive' : 'muted'} style={colorStyle}>
            {cents}
          </Text>
        ) : null}
        {showSymbol && currency ? (
          <Text {...textProps} tone="muted" style={colorStyle}>
            {withThinSpace(currencySymbol(currency))}
          </Text>
        ) : null}
      </Text>
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
  showSymbol: PropTypes.bool,
  size: PropTypes.string,
  tone: PropTypes.string,
  value: PropTypes.number,
};

export { PriceFriendly };
