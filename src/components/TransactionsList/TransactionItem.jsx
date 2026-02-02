import { useNavigation } from '@react-navigation/native';
import Card from '../Card';
import { Icon, Pressable, Text, View } from '../../design-system';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './TransactionsList.style';
import { useStore } from '../../contexts';
import { C, exchange, getIcon, L10N, verboseTime } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const {
  TX: {
    TYPE: { EXPENSE },
  },
  INTERNAL_TRANSFER,
} = C;

const TransactionItem = ({
  category = INTERNAL_TRANSFER,
  currency,
  timestamp,
  title,
  type = EXPENSE,
  value = 0,
  ...others
}) => {
  const { navigate } = useNavigation();
  const {
    settings: { baseCurrency },
    rates,
  } = useStore();

  const operator = type === EXPENSE ? -1 : 1;

  const handlePress = () => {
    navigate('clone', { ...others, category, currency, timestamp, title, type, value });
  };

  return (
    <Pressable onPress={handlePress}>
      <View row style={style.content}>
        <Card
          //
          small
          style={style.iconCard}>
          <Icon name={getIcon({ category, type, title })} />
        </Card>

        <View flex>
          <View gap row spaceBetween>
            <Text bold numberOfLines={1} style={style.text}>
              {title}
            </Text>
            <PriceFriendly
              bold
              color={type !== EXPENSE ? 'accent' : undefined}
              currency={currency}
              operator
              value={value * operator}
            />
          </View>

          <View gap row spaceBetween>
            <Text tiny color="contentLight" style={style.text}>
              {`${verboseTime(new Date(timestamp))} - ${L10N.CATEGORIES[type][category]}`}
            </Text>
            {baseCurrency !== currency && (
              <PriceFriendly
                tiny
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

TransactionItem.propTypes = {
  category: PropTypes.number,
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  type: PropTypes.number,
  value: PropTypes.number,
};

export { TransactionItem };
