import { Card, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './CardAccount.style';
import { useStore } from '../../contexts';
import { C, exchange } from '../../modules';
import { LineChart } from '../LineChart';
import { PriceFriendly } from '../PriceFriendly';

const CardAccount = ({
  balance = 0,
  chart = [],
  currency,
  highlight,
  percentage = 0,
  showExchange = false,
  title = '',
  onPress,
  ...others
}) => {
  const { settings: { baseCurrency, colorCurrency = false } = {}, rates } = useStore();

  const hasBalance = balance !== null && parseFloat(balance.toFixed(2)) > 0;
  const textColor = highlight ? 'base' : !hasBalance ? 'contentLight' : undefined;

  const color = hasBalance
    ? (colorCurrency && C.COLOR[currency]) || StyleSheet.value('$colorAccent')
    : StyleSheet.value('$colorContentLight');

  return (
    <Pressable onPress={onPress} style={others.style}>
      <Card {...others} color={highlight ? 'content' : undefined} spaceBetween style={style.card}>
        {currency && (
          <View>
            <View row>
              {colorCurrency && <View style={[style.color, { backgroundColor: color }]} />}
              <Text bold tiny color={textColor} ellipsizeMode numberOfLines={1}>
                {title.toUpperCase()}
              </Text>
            </View>

            <PriceFriendly bold color={textColor} currency={currency} subtitle value={Math.abs(balance)} />

            {showExchange && currency !== baseCurrency && (
              <PriceFriendly
                caption
                color={textColor || 'contentLight'}
                currency={baseCurrency}
                value={exchange(Math.abs(balance), currency, baseCurrency, rates)}
              />
            )}
          </View>
        )}
        {!!percentage && (
          <PriceFriendly
            bold
            tiny
            color={color}
            currency="%"
            detail
            fixed={2}
            operator
            value={percentage}
            style={style.percentage}
          />
        )}

        <LineChart
          color={!hasBalance ? StyleSheet.value('$colorContentLight') : undefined}
          currency={currency}
          height={StyleSheet.value('$cardAccountSize') / 2}
          isAnimated={false}
          values={chart}
          width={StyleSheet.value('$cardAccountSize')}
          style={style.chart}
        />
      </Card>
    </Pressable>
  );
};

CardAccount.propTypes = {
  balance: PropTypes.number,
  chart: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
  currency: PropTypes.string,
  highlight: PropTypes.bool,
  percentage: PropTypes.number,
  showExchange: PropTypes.bool,
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
};

export { CardAccount };
