import React, { useEffect, useMemo, useState } from 'react';

import { Chart, ItemGroupCategories, StatsRangeToggle } from './components';
import { queryMonth, queryChart } from './modules';
import { style } from './Stats.style';
import { Screen, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, getMonthDiff, L10N } from '../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: { TYPE: { EXPENSE, INCOME } = {} },
} = C;
const MAX_STATS_MONTHS = 48;

let debounceTimeout;

const Stats = () => {
  const store = useStore();
  const { colors } = useApp();
  const {
    settings: { baseCurrency, statsRangeMonths = STATS_MONTHS_LIMIT } = {},
    overall = {},
    txs = [],
    updateSettings,
  } = store;

  const monthsLimit = useMemo(() => {
    if (statsRangeMonths && statsRangeMonths > 0) return Math.min(statsRangeMonths, MAX_STATS_MONTHS);
    const chartLength = overall?.chartBalance?.length || 0;
    if (chartLength > 0) return Math.min(chartLength, MAX_STATS_MONTHS);
    if (txs.length > 0) {
      const firstTimestamp = Math.min(...txs.map(({ timestamp }) => timestamp || Date.now()));
      return Math.min(MAX_STATS_MONTHS, Math.max(1, getMonthDiff(new Date(firstTimestamp), new Date()) + 1));
    }
    return Math.min(STATS_MONTHS_LIMIT, MAX_STATS_MONTHS);
  }, [overall?.chartBalance?.length, statsRangeMonths, txs]);

  const [pointerIndex, setPointerIndex] = useState(Math.max(0, monthsLimit - 1));
  const safePointerIndex = useMemo(
    () => Math.max(0, Math.min(pointerIndex, Math.max(0, monthsLimit - 1))),
    [pointerIndex, monthsLimit],
  );

  useEffect(() => {
    setPointerIndex(Math.max(0, monthsLimit - 1));
  }, [monthsLimit]);

  const rangeOptions = useMemo(
    () => [
      { label: L10N.STATS_RANGE_1Y, value: 12 },
      { label: L10N.STATS_RANGE_2Y, value: 24 },
      { label: L10N.STATS_RANGE_4Y, value: 48 },
    ],
    [],
  );

  const selectedRange = statsRangeMonths === 0 ? MAX_STATS_MONTHS : Math.min(statsRangeMonths, MAX_STATS_MONTHS);
  const handleRangeChange = (value) => updateSettings({ statsRangeMonths: value });
  const chart = useMemo(() => queryChart(store, monthsLimit), [store, monthsLimit]);

  const handlePointerIndex = (next) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setPointerIndex((prev) => (next !== prev ? next : prev));
    }, 100);
  };

  const monthData = useMemo(
    () => queryMonth(store, safePointerIndex, monthsLimit) || {},
    [store, safePointerIndex, monthsLimit],
  );
  const { expenses = {}, incomes = {} } = monthData;
  const chartProps = { currency: baseCurrency, monthsLimit, pointerIndex: safePointerIndex };
  const color = colors.accent;
  const colorExpense = colors.text;
  const colorExpenseBars = colors.textSecondary;

  return (
    <Screen style={style.screen}>
      <Chart
        {...chartProps}
        color={color}
        headingRight={<StatsRangeToggle onChange={handleRangeChange} options={rangeOptions} value={selectedRange} />}
        scaleMode="median"
        title={L10N.TOTAL_BALANCE}
        values={chart.balance}
        onPointerChange={handlePointerIndex}
      />

      <Chart
        {...chartProps}
        compact
        color={[color, colorExpense]}
        hideMonth
        multipleData
        scaleMode="median"
        title={`${L10N.INCOMES} & ${L10N.EXPENSES}`}
        style={style.chartGap}
        values={[chart.incomes, chart.expenses]}
        onPointerChange={handlePointerIndex}
      />

      {Object.keys(incomes).length > 0 || Object.keys(expenses).length > 0 ? (
        <View style={style.sectionGap}>
          {Object.keys(incomes).length > 0 && <ItemGroupCategories color={color} type={INCOME} dataSource={incomes} />}
          {Object.keys(expenses).length > 0 && (
            <ItemGroupCategories color={colorExpenseBars} type={EXPENSE} dataSource={expenses} />
          )}
        </View>
      ) : null}

      <Chart
        {...chartProps}
        color={colors.text}
        scaleMode="median"
        title={L10N.TRANSFERS}
        values={chart.transfers}
        onPointerChange={handlePointerIndex}
      />
    </Screen>
  );
};

Stats.displayName = 'Stats';

export { Stats };
