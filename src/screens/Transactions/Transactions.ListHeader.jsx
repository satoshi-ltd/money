import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { getStyles } from './Transactions.style';
import { Delta, Eyebrow, PriceFriendly, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { accountBalanceEyebrow, C, getProgressionPercentage, ICON, L10N, monthFlow, percentText } from '../../modules';

const {
  TX: {
    TYPE: { INCOME, EXPENSE, TRANSFER },
  },
} = C;

const TransactionsListHeader = ({ dataSource }) => {
  const { accounts = [], settings: { baseCurrency } = {}, today } = useStore();
  const { colors } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);
  const { currency = baseCurrency, ...rest } = dataSource;

  const monthLabel = L10N.MONTHS[new Date(today || Date.now()).getMonth()];
  const progression = useMemo(() => {
    const next = getProgressionPercentage(rest?.currentBalance, rest?.currentMonth?.progressionCurrency);
    return Number.isFinite(next) ? next : undefined;
  }, [rest?.currentBalance, rest?.currentMonth?.progressionCurrency]);

  const flow = useMemo(() => monthFlow(dataSource?.txs || [], today), [dataSource?.txs, today]);
  const flowMax = Math.max(flow.incomes, flow.expenses, 1);

  return (
    <>
      {dataSource?.hash ? (
        <>
          <View style={style.balance}>
            <Eyebrow>{accountBalanceEyebrow(currency)}</Eyebrow>
            <PriceFriendly bold currency={currency} size="hero" value={rest?.currentBalance || 0} />
            <View row style={style.balanceRow}>
              <Delta caption={L10N.THIS_MONTH.toLowerCase()} value={progression} />
            </View>
          </View>

          {flow.incomes > 0 || flow.expenses > 0 ? (
            <View style={style.flow}>
              <Eyebrow style={style.monthLabel}>{monthLabel}</Eyebrow>
              <View style={style.flowRows}>
                <View row style={style.flowRow}>
                  <Text size="s" style={style.flowLabel} tone="muted">
                    {L10N.INCOMES}
                  </Text>
                  <View style={style.flowBar}>
                    <View style={[style.flowFillIncome, { width: `${(flow.incomes * 100) / flowMax}%` }]} />
                  </View>
                  <View style={style.flowValue}>
                    <PriceFriendly currency={currency} operator size="md" value={flow.incomes} />
                  </View>
                </View>
                <View row style={style.flowRow}>
                  <Text size="s" style={style.flowLabel} tone="muted">
                    {L10N.EXPENSES}
                  </Text>
                  <View style={style.flowBar}>
                    <View style={[style.flowFillExpense, { width: `${(flow.expenses * 100) / flowMax}%` }]} />
                  </View>
                  <View style={style.flowValue}>
                    <PriceFriendly currency={currency} size="md" value={-flow.expenses} />
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </>
  );
};

TransactionsListHeader.displayName = 'TransactionsListHeader';

TransactionsListHeader.propTypes = {
  dataSource: PropTypes.any,
};

export { TransactionsListHeader };
