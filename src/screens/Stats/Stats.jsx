import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';

import { ItemGroupCategories, MonthKpis } from './components';
import { queryMonth, queryChart, rangeDelta, RANGE_ALL, RANGE_VALUES, selectedRange as resolveRange } from './modules';
import { style } from './Stats.style';
import { Chart, FlowChart, Masthead, Screen, SegmentedToggle, View } from '../../components';
import { useStore } from '../../contexts';
import { C, getLastMonths, getMonthDiff, L10N, netWorthEyebrow } from '../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: { TYPE: { EXPENSE, INCOME } = {} },
} = C;
const MAX_STATS_MONTHS = 120;

let debounceTimeout;

const Stats = () => {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const store = useStore();
  const {
    accounts = [],
    rates = {},
    settings: { baseCurrency, statsRangeMonths = STATS_MONTHS_LIMIT } = {},
    overall = {},
    txs = [],
    updateSettings,
  } = store;

  const monthsLimit = useMemo(() => {
    if (RANGE_VALUES.includes(statsRangeMonths) && statsRangeMonths > 0) return statsRangeMonths;
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
      { label: L10N.STATS_FLOW_6M, value: 6 },
      { label: L10N.STATS_RANGE_1Y, value: 12 },
      { label: L10N.RANGE_ALL, value: RANGE_ALL },
    ],
    [],
  );

  const selectedRange = resolveRange(statsRangeMonths);
  const rangeCaption =
    selectedRange === RANGE_ALL
      ? L10N.STATS_RANGE_ALL_CAPTION
      : selectedRange === 6
        ? L10N.STATS_FLOW_6M_CAPTION
        : L10N.STATS_RANGE_1Y_CAPTION;
  const handleRangeChange = (value) => updateSettings({ statsRangeMonths: value });
  const statsSource = useMemo(
    () => ({ accounts, overall, rates, settings: { baseCurrency }, txs }),
    [accounts, overall, rates, baseCurrency, txs],
  );
  const chart = useMemo(() => queryChart(statsSource, monthsLimit), [statsSource, monthsLimit]);
  const rangeChange = useMemo(() => rangeDelta(chart.balance), [chart.balance]);

  const handlePointerIndex = (next) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setPointerIndex((prev) => (next !== prev ? next : prev));
    }, 100);
  };

  const monthData = useMemo(
    () => queryMonth(statsSource, safePointerIndex, monthsLimit) || {},
    [statsSource, safePointerIndex, monthsLimit],
  );
  const { expenses = {}, incomes = {} } = monthData;
  const monthTotals = useMemo(() => {
    const sum = (group) =>
      Object.values(group).reduce(
        (total, entries) => total + Object.values(entries).reduce((amount, value) => amount + value, 0),
        0,
      );
    return { expenses: sum(expenses), incomes: sum(incomes) };
  }, [expenses, incomes]);
  const months = useMemo(() => getLastMonths(monthsLimit), [monthsLimit]);
  const selectedMonth = months[safePointerIndex];
  const monthLabel = selectedMonth ? `${L10N.MONTHS[selectedMonth.month]} ${selectedMonth.year}` : undefined;

  return (
    <>
      <Masthead section={L10N.ACTIVITY}>
        <SegmentedToggle compact options={rangeOptions} value={selectedRange} onChange={handleRangeChange} />
      </Masthead>
      <Screen ref={scrollRef} style={style.screen}>

        <Chart
          currency={baseCurrency}
          caption={rangeCaption}
          delta={rangeChange}
          eyebrow={netWorthEyebrow({ accounts: accounts.length, currency: baseCurrency })}
          heroValue={overall?.currentBalance || 0}
          monthsLimit={monthsLimit}
          pointerIndex={safePointerIndex}
          style={style.chartGap}
          values={chart.balance}
          onPointerChange={handlePointerIndex}
        />

        <FlowChart
          currency={baseCurrency}
          expenses={chart.expenses}
          incomes={chart.incomes}
          monthsLimit={monthsLimit}
          selectedIndex={safePointerIndex}
          style={style.chartGap}
          onSelectMonth={handlePointerIndex}
        />

        <MonthKpis
          currency={baseCurrency}
          expenses={monthTotals.expenses}
          incomes={monthTotals.incomes}
          title={monthLabel || ''}
        />

        {Object.keys(expenses).length > 0 ? (
          <View style={style.sectionGap}>
            <ItemGroupCategories
              dataSource={expenses}
              month={selectedMonth?.month}
              monthLabel={monthLabel}
              type={EXPENSE}
              year={selectedMonth?.year}
            />
          </View>
        ) : null}

        {Object.keys(incomes).length > 0 ? (
          <View style={style.sectionGap}>
            <ItemGroupCategories
              dataSource={incomes}
              month={selectedMonth?.month}
              monthLabel={monthLabel}
              type={INCOME}
              year={selectedMonth?.year}
            />
          </View>
        ) : null}

      </Screen>
    </>
  );
};

Stats.displayName = 'Stats';

export { Stats };
