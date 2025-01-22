import { Screen } from '@satoshi-ltd/nano-design';
import React, { useLayoutEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Chart, ItemGroupCategories } from './components';
import { queryMonth, queryChart } from './modules';
import { style } from './Stats.style';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const Stats = () => {
  const store = useStore();

  const [chart, setChart] = useState({});
  const [pointerIndex, setPointerIndex] = useState(STATS_MONTHS_LIMIT - 1);

  const { settings: { baseCurrency, colorCurrency } = {}, txs } = store;

  useLayoutEffect(() => {
    setChart(queryChart(store));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCurrency, txs]);

  const handlePointerIndex = (next) => {
    if (next !== pointerIndex) setPointerIndex(next);
  };

  const { expenses = {}, incomes = {} } = queryMonth(store, pointerIndex) || {};
  const chartProps = { currency: baseCurrency, pointerIndex };
  const color = (colorCurrency && C.COLOR[baseCurrency]) || StyleSheet.value('$colorAccent');
  const colorExpense = StyleSheet.value('$colorContent');

  return (
    <Screen style={style.screen}>
      <Chart
        {...chartProps}
        color={color}
        title={L10N.OVERALL_BALANCE}
        values={chart.balance}
        onPointerChange={handlePointerIndex}
      />

      <Chart
        {...chartProps}
        color={[color, colorExpense]}
        hideMonth
        multipleData
        title={`${L10N.INCOMES} & ${L10N.EXPENSES}`}
        values={[chart.incomes, chart.expenses]}
      />

      {Object.keys(incomes).length > 0 && <ItemGroupCategories color={color} type={INCOME} dataSource={incomes} />}
      {Object.keys(expenses).length > 0 && <ItemGroupCategories type={EXPENSE} dataSource={expenses} />}

      <Chart
        {...chartProps}
        color={StyleSheet.value('$colorContent')}
        title={L10N.TRANSFERS}
        values={chart.transfers}
      />
    </Screen>
  );
};

Stats.displayName = 'Stats';

export { Stats };
