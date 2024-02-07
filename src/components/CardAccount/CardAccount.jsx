import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardAccount.style';
import { Card, Pressable, Text, View } from '../../__design-system__';
import { useStore } from '../../contexts';
import { getCurrencySymbol, exchange } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const CardAccount = ({
  balance = 0,
  currency,
  highlight,
  percentage = 0,
  showExchange = false,
  title = '',
  onPress,
  ...others
}) => {
  const {
    settings: { baseCurrency },
    rates,
  } = useStore();

  const hasBalance = balance !== null && parseFloat(balance.toFixed(2)) > 0;
  const textColor = highlight ? 'base' : undefined;

  return (
    <Pressable onPress={onPress} style={others.style}>
      <Card
        {...others}
        color={highlight ? 'content' : undefined}
        outlined={!highlight && !hasBalance}
        spaceBetween
        style={style.card}
      >
        {currency && (
          <View>
            <Text bold caption color={textColor} ellipsizeMode numberOfLines={1}>
              {title.toUpperCase()}
            </Text>

            <PriceFriendly bold color={textColor} currency={currency} subtitle value={Math.abs(balance)} />

            {showExchange && currency !== baseCurrency && (
              <PriceFriendly
                color={textColor || 'contentLight'}
                currency={baseCurrency}
                caption
                value={exchange(Math.abs(balance), currency, baseCurrency, rates)}
              />
            )}
          </View>
        )}

        <View row spaceBetween>
          <Card color={hasBalance ? 'base' : 'border'} small style={style.cardCurrency}>
            <Text align="center" bold color={!highlight ? 'contentLight' : undefined}>
              {getCurrencySymbol(currency)}
            </Text>
          </Card>

          {!!percentage && (
            <PriceFriendly
              bold
              color={textColor || 'contentLight'}
              currency="%"
              detail
              fixed={2}
              operator
              value={percentage}
            />
          )}
        </View>
      </Card>
    </Pressable>
  );
};

CardAccount.propTypes = {
  balance: PropTypes.number,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  percentage: PropTypes.number,
  showExchange: PropTypes.bool,
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

export { CardAccount };
