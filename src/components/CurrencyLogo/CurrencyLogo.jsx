import { Card, Text } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CurrencyLogo.style';
import { getCurrencySymbol } from '../../modules';

const CurrencyLogo = ({ color = 'base', currency, highlight, ...others }) => {
  const symbol = getCurrencySymbol(currency);

  return (
    <Card {...others} color={color} small style={[style.cardCurrency, others.style]}>
      {symbol ? (
        <Text
          bold
          color={!highlight ? 'contentLight' : undefined}
          caption={symbol.length === 1}
          tiny={symbol.length > 1}
        >
          {symbol}
        </Text>
      ) : null}
    </Card>
  );
};

CurrencyLogo.propTypes = {
  color: PropTypes.string,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  secondary: PropTypes.bool,
};

export { CurrencyLogo };
