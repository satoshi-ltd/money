import { Icon, Pressable, Text, View } from '../../primitives';
import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Summary.style';
import { useStore } from '../../contexts';
import { C, exchange, getProgressionPercentage, ICON, L10N } from '../../modules';
import { Heading } from '../Heading';
import { PriceFriendly } from '../PriceFriendly';

const { CURRENCY } = C;

const Summary = ({ children, currency = CURRENCY, currentBalance, currentMonth = {}, title, noPadding = false }) => {
  const {
    rates,
    settings: { baseCurrency, maskAmount },
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
  const accentColor = 'accent';


  return (
    <View style={[style.container, noPadding ? style.noPadding : null]}>
      <View style={style.heading}>
        <Heading value={!title ? L10N.TOTAL_BALANCE : `${title} ${L10N.BALANCE}`} />
      </View>

      <View row style={style.balanceRow}>
        <Pressable onPress={() => updateSettings({ maskAmount: !maskAmount })}>
          <PriceFriendly bold currency={currency} size="xl" value={currentBalance} />
        </Pressable>
        {baseCurrency !== currency && (
          <PriceFriendly
            bold
            color="contentLight"
            currency={baseCurrency}
            label="≈"
            size="xs"
            value={exchange(Math.abs(currentBalance), currency, baseCurrency, rates)}
          />
        )}
      </View>

      {progressionPercentage !== 0 && (
        <View row style={style.progression}>
          <Icon
            color={progressionPercentage > 0 ? accentColor : undefined}
            size="s"
            name={`trending-${progressionPercentage > 0 ? 'up' : 'down'}`}
          />
          <PriceFriendly
            bold
            color={progressionPercentage > 0 ? accentColor : undefined}
            currency="%"
            fixed={progressionPercentage >= 100 ? 0 : undefined}
            operator
            size="xs"
            value={progressionPercentage}
          />
          <Text tone="secondary" size="xs">
            {L10N.IN_THIS_PAST_MONTH}
          </Text>
          <View flex />

          <View row style={style.tags}>
            {(incomes > 0 || incomesBase > 0) && (
            <View row style={style.tag}>
              <Icon color={accentColor} name={ICON.INCOME} size="xs" />
              <PriceFriendly bold color={accentColor} currency={currency} size="xs" value={incomesBase || incomes} />
            </View>
          )}
          {(expenses > 0 || expensesBase > 0) && (
            <View row style={style.tag}>
              <Icon name={ICON.EXPENSE} size="xs" />
              <PriceFriendly bold currency={currency} size="xs" value={expensesBase || expenses} />
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
  noPadding: PropTypes.bool,
  title: PropTypes.string,
};

export { Summary };
