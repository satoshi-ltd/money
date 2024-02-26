import { Pressable, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';

import { verboseMonth } from './helpers';
import { SummaryBox } from './Summary.Box';
import { style } from './Summary.style';
import { useStore } from '../../contexts';
import { C, exchange, getProgressionPercentage, L10N } from '../../modules';
import { PriceFriendly } from '../PriceFriendly';

const { CURRENCY } = C;

const Summary = ({ children, currency = CURRENCY, currentBalance, currentMonth = {}, detail = false }) => {
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
      <Text bold caption color="contentLight">
        {L10N.BALANCE}
      </Text>

      <Pressable onPress={() => updateSettings({ maskAmount: !maskAmount })}>
        <PriceFriendly bold currency={currency} title value={Math.abs(currentBalance)} />
      </Pressable>
      {baseCurrency !== currency && (
        <PriceFriendly
          bold
          color="contentLight"
          currency={baseCurrency}
          value={exchange(Math.abs(currentBalance), currency, baseCurrency, rates)}
        />
      )}

      {detail && (
        <View style={style.summary}>
          <SummaryBox
            caption={verboseMonth(new Date(), L10N)}
            currency="%"
            highlight={progressionPercentage > 0}
            operator
            value={progressionPercentage}
          />
          <SummaryBox caption={L10N.INCOMES} currency={baseCurrency} value={incomes} />
          <SummaryBox caption={L10N.EXPENSES} currency={baseCurrency} value={expenses} />
          <SummaryBox caption={L10N.TODAY} currency={baseCurrency} operator value={today} />
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
};

export { Summary };
