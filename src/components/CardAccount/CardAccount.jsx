import PropTypes from 'prop-types';
import React from 'react';

import { style } from './CardAccount.style';
import { useApp, useStore } from '../../contexts';
import { exchange } from '../../modules';
import { Pressable, Text, View } from '../../primitives';
import { cardAccountSize } from '../../theme/layout';
import Card from '../Card';
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
  const { colors } = useApp();
  const {
    settings: { baseCurrency },
    rates,
  } = useStore();
  const hasBalance = balance !== null && parseFloat(balance.toFixed(2)) > 0;
  const chartColor = highlight ? colors.onAccent : !hasBalance ? colors.textSecondary : colors.accent;

  const baseTone = !hasBalance ? 'secondary' : 'primary';
  const mainTone = highlight ? 'onAccent' : baseTone;
  const exchangeTone = highlight ? 'onAccent' : 'secondary';
  const percentageTone = highlight ? 'onAccent' : 'accent';

  const showPercentage = Math.abs(percentage) >= 3;
  const chartValues = Array.isArray(chart) ? chart.slice(-6) : [];

  return (
    <Pressable onPress={onPress} style={others.style}>
      <Card {...others} active={highlight} style={style.card}>
        <View style={style.content}>
          <LineChart
            color={chartColor}
            currency={currency}
            height={cardAccountSize / 2}
            isAnimated={false}
            values={chartValues}
            width={cardAccountSize}
            style={style.chart}
          />

          <View style={style.overlay}>
            {currency ? (
              <View>
                <View row>
                  <Text bold ellipsizeMode="tail" numberOfLines={1} size="xs" tone={mainTone}>
                    {title.toUpperCase()}
                  </Text>
                </View>

                <PriceFriendly bold currency={currency} size="l" tone={mainTone} value={Math.abs(balance)} />

                {showExchange && currency !== baseCurrency ? (
                  <PriceFriendly
                    size="s"
                    tone={exchangeTone}
                    currency={baseCurrency}
                    value={exchange(Math.abs(balance), currency, baseCurrency, rates)}
                  />
                ) : null}
              </View>
            ) : null}
            {showPercentage ? (
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
            ) : null}
          </View>
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
