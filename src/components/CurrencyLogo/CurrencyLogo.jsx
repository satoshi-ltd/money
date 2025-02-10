import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CurrencyLogo.style';
import { useStore } from '../../contexts';
import { C, getCurrencySymbol } from '../../modules';

const CurrencyLogo = ({ currency, highlight, ...others }) => {
  const { settings: { colorCurrency } = {} } = useStore();

  const symbol = getCurrencySymbol(currency);
  const color = colorCurrency ? C.COLOR[currency] : undefined;

  return (
    <View style={[style.container, others.style]}>
      <View
        style={[
          style.coin,
          colorCurrency ? style.colorCurrency : highlight ? style.highlight : undefined,
          colorCurrency ? { backgroundColor: color } : undefined,
        ]}
      />
      {symbol ? (
        <Text
          bold
          //
          color={colorCurrency ? color : !highlight ? 'base' : undefined}
          caption={symbol.length === 1}
          tiny={symbol.length > 1}
        >
          {symbol}
        </Text>
      ) : null}
    </View>
  );
};

CurrencyLogo.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  secondary: PropTypes.bool,
};

export { CurrencyLogo };
