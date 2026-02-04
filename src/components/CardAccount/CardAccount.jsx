import Card from '../Card';
import { Pressable, Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './CardAccount.style';
import { useStore } from '../../contexts';
import { exchange } from '../../modules';
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
  const {
    settings: { baseCurrency },
    rates,
  } = useStore();
  const hasBalance = balance !== null && parseFloat(balance.toFixed(2)) > 0;
  const textColor = highlight ? 'base' : !hasBalance ? 'contentLight' : undefined;

  const color = hasBalance ? StyleSheet.value('$colorAccent') : StyleSheet.value('$colorContentLight');
  const percentageColor = highlight ? StyleSheet.value('$colorBase') : color;
  const chartColor = highlight
    ? StyleSheet.value('$colorBase')
    : !hasBalance
      ? StyleSheet.value('$colorContentLight')
      : StyleSheet.value('$colorAccent');

  const showPercentage = Math.abs(percentage) >= 3;

  return (
    <Pressable onPress={onPress} style={others.style}>
      <Card {...others} active={highlight} style={style.card}>
        <View style={style.content}>
          {currency && (
            <View>
              <View row>
                <Text bold color={textColor} ellipsizeMode="tail" numberOfLines={1} size="xs">
                  {title.toUpperCase()}
                </Text>
              </View>

              <PriceFriendly bold color={textColor} currency={currency} size="l" value={Math.abs(balance)} />

              {showExchange && currency !== baseCurrency && (
                <PriceFriendly
                  size="s"
                  color={textColor || 'contentLight'}
                  currency={baseCurrency}
                  value={exchange(Math.abs(balance), currency, baseCurrency, rates)}
                />
              )}
            </View>
          )}
          {showPercentage && (
            <PriceFriendly
              bold
              size="s"
              color={percentageColor}
              currency="%"
              fixed={2}
              operator
              style={style.percentage}
              value={percentage}
            />
          )}

          <LineChart
            color={chartColor}
            currency={currency}
            height={StyleSheet.value('$cardAccountSize') / 2}
            isAnimated={false}
            values={chart}
            width={StyleSheet.value('$cardAccountSize')}
            style={style.chart}
          />
        </View>
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
