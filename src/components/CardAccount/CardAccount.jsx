import Card from '../Card';
import { Pressable, Text, View } from '../../primitives';
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
  const color = hasBalance ? StyleSheet.value('$colorAccent') : StyleSheet.value('$colorContentLight');
  const chartColor = highlight
    ? StyleSheet.value('$colorBase')
    : !hasBalance
      ? StyleSheet.value('$colorContentLight')
      : StyleSheet.value('$colorAccent');

  const baseTone = !hasBalance ? 'secondary' : 'primary';
  const mainTone = highlight ? 'inverse' : baseTone;
  const exchangeTone = highlight ? 'inverse' : 'secondary';
  const percentageTone = highlight ? 'inverse' : 'accent';

  const showPercentage = Math.abs(percentage) >= 3;

  return (
    <Pressable onPress={onPress} style={others.style}>
      <Card {...others} active={highlight} style={style.card}>
        <View style={style.content}>
          {currency && (
            <View>
              <View row>
                <Text bold ellipsizeMode="tail" numberOfLines={1} size="xs" tone={mainTone}>
                  {title.toUpperCase()}
                </Text>
              </View>

              <PriceFriendly bold currency={currency} size="l" tone={mainTone} value={Math.abs(balance)} />

              {showExchange && currency !== baseCurrency && (
                <PriceFriendly
                  size="s"
                  tone={exchangeTone}
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
              currency="%"
              fixed={2}
              operator
              style={style.percentage}
              tone={percentageTone}
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
