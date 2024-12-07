import { Screen } from '@satoshi-ltd/nano-design';
import React, { useLayoutEffect, useMemo, useState } from 'react';

import { Chart, ItemGroupCategories, SliderMonths } from './components';
import { calcScales, orderCaptions, queryMonth, queryChart } from './modules';
import { style } from './Stats.style';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const captions = orderCaptions(L10N);

const Stats = () => {
  const store = useStore();

  const [chart, setChart] = useState({});
  const [slider, setSlider] = useState({});
  const [month, setMonth] = useState(undefined);

  const {
    settings: { baseCurrency },
    txs,
  } = store;

  useLayoutEffect(() => {
    const today = new Date();
    const { month = today.getMonth(), year = today.getFullYear(), index = STATS_MONTHS_LIMIT - 1 } = slider;

    setChart(queryChart(store));
    setMonth(queryMonth(store, { month, year }));
    if (!slider.index) setTimeout(() => setSlider({ month, year, index }), 300);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs]);

  const handleSliderChange = (next) => {
    if (next.index !== slider.index) {
      setSlider(next);
      setMonth(queryMonth(store, next));
    }
  };

  const { expenses = {}, incomes = {} } = month || {};
  const hasExpenses = Object.keys(expenses).length > 0;
  const hasIncomes = Object.keys(incomes).length > 0;
  const chartProps = { currency: baseCurrency, highlight: slider.index };

  return (
    <Screen style={style.screen}>
      <SliderMonths {...slider} onChange={handleSliderChange} />

      <Chart
        {...useMemo(() => calcScales(chart.balance), [chart.balance])}
        {...chartProps}
        captions={captions}
        color="accent"
        title={L10N.OVERALL_BALANCE}
        values={chart.balance}
        style={style.chartMargin}
      />

      <Chart
        {...useMemo(() => calcScales(chart.incomes), [chart.incomes])}
        {...chartProps}
        color="accent"
        title={`${L10N.INCOMES} & ${L10N.EXPENSES}`}
        values={chart.incomes}
      />

      <Chart
        {...useMemo(() => calcScales(chart.expenses), [chart.expenses])}
        {...chartProps}
        captions={captions}
        inverted
        style={style.chartMargin}
        values={chart.expenses}
      />

      {(hasExpenses || hasIncomes) && (
        <>
          {hasIncomes && <ItemGroupCategories type={INCOME} dataSource={incomes} />}
          {hasExpenses && <ItemGroupCategories type={EXPENSE} dataSource={expenses} />}
        </>
      )}

      <Chart
        {...useMemo(() => calcScales(chart.transfers), [chart.transfers])}
        {...chartProps}
        captions={captions}
        title={L10N.TRANSFERS}
        values={chart.transfers}
      />
    </Screen>
  );
};

Stats.displayName = 'Stats';

export { Stats };
