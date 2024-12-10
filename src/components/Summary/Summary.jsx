import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Summary.style';
import { useStore } from '../../contexts';
import { C, exchange, getProgressionPercentage, ICON, L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const { CURRENCY } = C;

const Summary = ({ children, currency = CURRENCY, currentBalance, currentMonth = {}, title }) => {
  const {
    rates,
    settings: { baseCurrency, maskAmount },
    updateSettings,
  } = useStore();

  const { expenses = 0, incomes = 0, progression = 0, progressionCurrency = 0, today = 0 } = currentMonth;
  const progressionPercentage = getProgressionPercentage(
    currentBalance,
    currency === baseCurrency ? progression : progressionCurrency,
  );

  return (
    <View style={style.container}>
      {/* <Text bold caption color="contentLight">
        {L10N.TOTAL_BALANCE}
      </Text> */}

      <View row spaceBetween>
        <Text bold secondary subtitle>
          {!title ? L10N.TOTAL_BALANCE : `${title} ${L10N.BALANCE}`}
        </Text>
        <View row style={style.tags}>
          {incomes > 0 && (
            <View row>
              <Icon color="accent" name={ICON.INCOME} caption />
              <PriceFriendly bold color="accent" currency={currency} _operator value={incomes} tiny />
            </View>
          )}
          {expenses > 0 && (
            <View row>
              <Icon name={ICON.EXPENSE} caption />
              <PriceFriendly bold currency={currency} _operator value={expenses * 1} tiny />
            </View>
          )}
        </View>
      </View>

      <Pressable onPress={() => updateSettings({ maskAmount: !maskAmount })}>
        <PriceFriendly bold currency={currency} title value={currentBalance} />
      </Pressable>

      {baseCurrency !== currency && (
        <PriceFriendly
          bold
          color="contentLight"
          currency={baseCurrency}
          value={exchange(Math.abs(currentBalance), currency, baseCurrency, rates)}
        />
      )}

      {progressionPercentage !== 0 && (
        <View row style={style.progression}>
          <Icon
            color={progressionPercentage > 0 ? 'accent' : undefined}
            name={`trending-${progressionPercentage > 0 ? 'up' : 'down'}`}
          />
          <PriceFriendly
            bold
            color={progressionPercentage > 0 ? 'accent' : undefined}
            currency="%"
            fixed={progressionPercentage >= 100 ? 0 : undefined}
            operator
            tiny
            value={progressionPercentage}
          />
          <Text color="contentLight" tiny>
            {L10N.IN_THIS_PAST_MONTH}
          </Text>
        </View>
      )}

      {children && <View style={style.children}>{children}</View>}
    </View>
  );
};

Summary.propTypes = {
  children: PropTypes.node,
  currency: PropTypes.string,
  currentBalance: PropTypes.number,
  currentMonth: PropTypes.shape({}),
  detail: PropTypes.bool,
  title: PropTypes.string,
};

export { Summary };
