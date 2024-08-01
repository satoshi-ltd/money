import { useNavigation } from '@react-navigation/native';
import { Card, Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
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

const GroupTransactionsItem = ({
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

  const is = {
    income: type === INCOME,
    expense: type === EXPENSE,
    swap: type === INCOME && category === INTERNAL_TRANSFER,
  };

  return (
    <Pressable onPress={handlePress}>
      <View row style={style.content}>
        <Card align="center" small style={style.cardIcon}>
          <Icon name={getIcon({ category, type, title })} />
        </Card>

        <View flex>
          <View gap row spaceBetween>
            <Text bold numberOfLines={1}>
              {title}
            </Text>
            <PriceFriendly
              bold
              currency={currency}
              highlight={is.income}
              operator={is.expense}
              value={value * operator}
            />
          </View>

          <View gap row spaceBetween>
            <Text color="contentLight" caption>
              {`${verboseTime(new Date(timestamp))} - ${L10N.CATEGORIES[type][category]}`}
            </Text>
            {baseCurrency !== currency && (
              <PriceFriendly
                color="contentLight"
                currency={baseCurrency}
                caption
                operator={is.expense}
                value={exchange(value, currency, baseCurrency, rates, timestamp) * operator}
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

GroupTransactionsItem.propTypes = {
  category: PropTypes.number,
  currency: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  type: PropTypes.number,
  value: PropTypes.number,
};

export { GroupTransactionsItem };
