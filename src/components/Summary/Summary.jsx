import { Icon, Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Summary.style';
import { useStore } from '../../contexts';
import { C, exchange, getProgressionPercentage, ICON, L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const { COLOR, CURRENCY } = C;

const Summary = ({ children, currency = CURRENCY, currentBalance, currentMonth = {}, title }) => {
  const {
    rates,
    settings: { baseCurrency, colorCurrency = false, maskAmount },
    updateSettings,
  } = useStore();

  const {
    expenses = 0,
    expensesBase = 0,
    incomes = 0,
    incomesBase = 0,
    progression = 0,
    progressionCurrency = 0,
  } = currentMonth;
  const progressionPercentage = getProgressionPercentage(
    currentBalance,
    currency === baseCurrency ? progression : progressionCurrency,
  );

  const color = (colorCurrency && COLOR[currency]) || 'accent';

  return (
    <View style={style.container}>
      <View row spaceBetween>
        <View row>
          {colorCurrency && title && <View style={[style.color, { backgroundColor: COLOR[currency] }]} />}
          <Text bold secondary subtitle>
            {!title ? L10N.TOTAL_BALANCE : `${title} ${L10N.BALANCE}`}
          </Text>
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
            color={progressionPercentage > 0 ? color : undefined}
            name={`trending-${progressionPercentage > 0 ? 'up' : 'down'}`}
          />
          <PriceFriendly
            bold
            color={progressionPercentage > 0 ? color : undefined}
            currency="%"
            fixed={progressionPercentage >= 100 ? 0 : undefined}
            operator
            tiny
            value={progressionPercentage}
          />
          <Text color="contentLight" tiny>
            {L10N.IN_THIS_PAST_MONTH}
          </Text>
          <View flex />

          <View row style={style.tags}>
            {(incomes > 0 || incomesBase > 0) && (
              <View row style={[style.tag, style.income]}>
                <Icon color={color} name={ICON.INCOME} caption />
                <PriceFriendly bold color={color} currency={currency} tiny value={incomesBase || incomes} />
              </View>
            )}
            {(expenses > 0 || expensesBase > 0) && (
              <View row style={style.tag}>
                <Icon name={ICON.EXPENSE} caption />
                <PriceFriendly bold currency={currency} tiny value={expensesBase || expenses} />
              </View>
            )}
          </View>
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
