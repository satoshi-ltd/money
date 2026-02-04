import { useNavigation } from '@react-navigation/native';
import Card from '../Card';
import { Icon, Pressable, Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './GroupTransaction.style';
import { useStore } from '../../contexts';
import { C, exchange, getIcon, L10N, verboseTime } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
  INTERNAL_TRANSFER,
} = C;

const Item = ({ category = INTERNAL_TRANSFER, currency, timestamp, title, type = EXPENSE, value = 0, ...others }) => {
  const { navigate } = useNavigation();
  const {
    settings: { baseCurrency },
    rates,
  } = useStore();

  const operator = type === EXPENSE ? -1 : 1;

  const handlePress = () => {
    navigate('clone', { ...others, category, currency, timestamp, title, type, value });
  };

  const is = {
    income: type === INCOME,
    expense: type === EXPENSE,
    swap: type === INCOME && category === INTERNAL_TRANSFER,
  };

  return (
    <Pressable onPress={handlePress}>
      <View row style={style.content}>
        <Card style={style.cardIcon} size="s">
          <Icon name={getIcon({ category, type, title })} />
        </Card>

        <View flex>
          <View gap row spaceBetween>
            <Text flex bold numberOfLines={1} style={style.text}>
              {title}
            </Text>
            <PriceFriendly
              bold
              color={is.income ? 'accent' : undefined}
              currency={currency}
              operator
              value={value * operator}
            />
          </View>

          <View gap row spaceBetween>
            <Text tone="secondary" size="s">
              {`${verboseTime(new Date(timestamp))} - ${L10N.CATEGORIES[type][category]}`}
            </Text>
            {baseCurrency !== currency && (
              <PriceFriendly
                size="s"
                color="contentLight"
                currency={baseCurrency}
                value={exchange(value, currency, baseCurrency, rates, timestamp)}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

Item.propTypes = {
  category: PropTypes.number,
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  type: PropTypes.number,
  value: PropTypes.number,
};

export { Item };
