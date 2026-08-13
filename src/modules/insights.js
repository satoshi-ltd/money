import { C } from './constants';
import { exchange } from './exchange';
import { isInternalTransfer } from './isInternalTransfer';
import { L10N } from './l10n';
import { getOccurrencesBetween } from './recurrence';
import { getScheduledOccurrenceKey, getScheduledOccurrenceKeyFromTx } from './scheduledKey';

const { TX: { TYPE } = {} } = C;

const BASELINE_MONTHS = 3;
const HISTORY_MONTHS = 6;
const TREND_MONTHS = 12;
const TREND_FLAT_BAND = 5;
const MIN_BASELINE_SHARE = 0.1;
const MIN_MOVER_SHARE = 0.05;
const MIN_MOVER_DELTA = 10;
const MIN_LINEAR_DAY = 5;
const MAX_DELTA = 999;

const monthKey = (date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

const shiftMonthKey = (date, offset) => monthKey(new Date(date.getFullYear(), date.getMonth() - offset, 1));

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const daysInMonthFromKey = (key) => {
  const [year, month] = `${key}`.split('-');
  return new Date(Number(year), Number(month), 0).getDate();
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sum = (values = []) => values.reduce((total, value) => total + value, 0);

const median = (values = []) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const percentDelta = (value, baseline) => clamp(((value - baseline) / baseline) * 100, -MAX_DELTA, MAX_DELTA);

const formatPercentAbs = (value) => `${Math.abs(Math.round(value))}%`;

const categoryLabel = (category) => L10N.CATEGORIES?.[0]?.[category] || `${category}`;

export const buildInsights = ({
  accounts = [],
  now: nowProp,
  rates = {},
  scheduledTxs = [],
  settings = {},
  txs = [],
} = {}) => {
  const baseCurrency = settings.baseCurrency;
  const now = nowProp instanceof Date ? nowProp : new Date();
  const currentKey = monthKey(now);
  const daysInMonth = getDaysInMonth(now);
  const elapsedDay = Math.min(now.getDate(), daysInMonth);
  const accountMap = new Map(accounts.map((account) => [account.hash, account]));

  const months = new Map();
  const monthEntry = (key) => {
    if (!months.has(key))
      months.set(key, { categoriesToDate: {}, expenses: 0, expensesToDate: 0, incomes: 0, incomesToDate: 0 });
    return months.get(key);
  };

  const recordedOccurrences = new Set();
  let firstKey;
  let pendingExpenses = 0;
  let pendingIncomes = 0;

  (Array.isArray(txs) ? txs : []).forEach((tx) => {
    if (!tx || isInternalTransfer(tx)) return;
    if (tx.type !== TYPE.EXPENSE && tx.type !== TYPE.INCOME) return;

    const timestamp = Number(tx.timestamp);
    const value = Number(tx.value);
    if (!Number.isFinite(timestamp) || !Number.isFinite(value) || value === 0) return;

    const account = accountMap.get(tx.account);
    if (!account) return;

    const currency = account.currency || baseCurrency;
    const amount = exchange(value, currency, baseCurrency, rates, timestamp);
    if (!Number.isFinite(amount)) return;

    const occurrenceKey = getScheduledOccurrenceKeyFromTx(tx);
    if (occurrenceKey) recordedOccurrences.add(occurrenceKey);

    const date = new Date(timestamp);
    const key = monthKey(date);
    const entry = monthEntry(key);
    const toDate = date.getDate() <= Math.min(elapsedDay, getDaysInMonth(date));

    if (!firstKey || key < firstKey) firstKey = key;

    if (tx.type === TYPE.EXPENSE) {
      entry.expenses += amount;
      if (toDate) {
        entry.expensesToDate += amount;
        if (tx.category !== undefined && tx.category !== null)
          entry.categoriesToDate[tx.category] = (entry.categoriesToDate[tx.category] || 0) + amount;
      } else if (key === currentKey) pendingExpenses += amount;
    } else {
      entry.incomes += amount;
      if (toDate) entry.incomesToDate += amount;
      else if (key === currentKey) pendingIncomes += amount;
    }
  });

  const fromAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0, 0).getTime();
  const toAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 0, 0, 0).getTime();

  (Array.isArray(scheduledTxs) ? scheduledTxs : []).forEach((scheduled) => {
    if (!scheduled || isInternalTransfer(scheduled)) return;
    if (scheduled.type !== TYPE.EXPENSE && scheduled.type !== TYPE.INCOME) return;

    const value = Number(scheduled.value);
    if (!Number.isFinite(value) || value === 0) return;

    const account = accountMap.get(scheduled.account);
    if (!account) return;

    const currency = account.currency || baseCurrency;

    getOccurrencesBetween({ scheduled, fromAt, toAt }).forEach((occurrenceAt) => {
      const key = getScheduledOccurrenceKey({ scheduledId: scheduled.id, occurrenceAt });
      if (key && recordedOccurrences.has(key)) return;

      const amount = exchange(value, currency, baseCurrency, rates, occurrenceAt);
      if (!Number.isFinite(amount)) return;

      if (scheduled.type === TYPE.EXPENSE) pendingExpenses += amount;
      else pendingIncomes += amount;
    });
  });

  const monthTotal = (key) => months.get(key)?.expenses || 0;
  const monthToDate = (key) => months.get(key)?.expensesToDate || 0;
  const inHistory = (key) => firstKey !== undefined && key >= firstKey;
  const previousKeys = (count) =>
    Array.from({ length: count }, (item, index) => shiftMonthKey(now, index + 1)).filter(inHistory);

  const currentEntry = months.get(currentKey);
  const currentExpenses = currentEntry?.expensesToDate || 0;
  const currentIncomes = currentEntry?.incomesToDate || 0;

  const baselineKeys = previousKeys(BASELINE_MONTHS).filter((key) => monthTotal(key) > 0);
  const baselineToDate = median(baselineKeys.map(monthToDate));
  const baselineTotalSum = sum(baselineKeys.map(monthTotal));
  const elapsedShare = baselineTotalSum > 0 ? sum(baselineKeys.map(monthToDate)) / baselineTotalSum : 0;
  const baselineCaption =
    baselineKeys.length === BASELINE_MONTHS ? L10N.INSIGHT_VS_LAST_3_MONTHS : L10N.INSIGHT_VS_USUAL;

  const insights = [];

  const trendKeys = [];
  for (let index = TREND_MONTHS - 1; index >= 0; index -= 1) {
    const key = shiftMonthKey(now, index);
    if (inHistory(key)) trendKeys.push(key);
  }
  const trendValues = trendKeys.map((key) => (key === currentKey ? monthToDate(key) : monthTotal(key)));
  const chart =
    trendValues.length >= 2 && trendValues.some((value) => value > 0)
      ? { values: trendValues, monthsLimit: trendValues.length }
      : undefined;

  const comparable = baselineToDate > 0 && elapsedShare >= MIN_BASELINE_SHARE;

  if (comparable) {
    const delta = Math.round(percentDelta(currentExpenses, baselineToDate));
    const title =
      delta > TREND_FLAT_BAND
        ? L10N.INSIGHT_SPENDING_MORE_TITLE
        : delta < -TREND_FLAT_BAND
        ? L10N.INSIGHT_SPENDING_LESS_TITLE
        : L10N.INSIGHT_SPENDING_FLAT_TITLE;

    insights.push({
      id: 'spending_trend',
      title,
      caption: baselineCaption,
      type: 'trend',
      value: delta,
      valueLabel: formatPercentAbs(delta),
      meta: { baseline: baselineToDate, day: elapsedDay, spent: currentExpenses },
      tone: delta > TREND_FLAT_BAND ? 'negative' : delta < -TREND_FLAT_BAND ? 'positive' : 'neutral',
      chart,
    });
  } else if (chart) {
    insights.push({
      id: 'spending_trend',
      title: L10N.INSIGHT_SPENDING_TREND_FALLBACK,
      caption: trendValues.length === TREND_MONTHS ? L10N.INSIGHT_LAST_12_MONTHS : undefined,
      type: 'trend',
      chart,
      tone: 'neutral',
    });
  }

  const currentCategories = currentEntry?.categoriesToDate || {};
  const categoryBaseline = (category) =>
    median(baselineKeys.map((key) => months.get(key)?.categoriesToDate?.[category] || 0));

  const topCategories = Object.entries(currentCategories)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => {
      const avg = categoryBaseline(category);
      return {
        category: Number(category),
        label: categoryLabel(category),
        amount,
        avg,
        delta: avg > 0 ? percentDelta(amount, avg) : 0,
        share: currentExpenses > 0 ? (amount / currentExpenses) * 100 : 0,
      };
    });

  if (topCategories.length > 0) {
    insights.push({
      id: 'top_categories',
      title: L10N.INSIGHT_TOP_CATEGORIES_TITLE,
      caption: L10N.INSIGHT_TOP_CATEGORIES_CAPTION,
      type: 'categories',
      items: topCategories,
      tone: 'neutral',
    });
  }

  if (currentExpenses > 0 || currentIncomes > 0 || pendingExpenses > 0 || pendingIncomes > 0) {
    const value = currentIncomes - currentExpenses;

    insights.push({
      id: 'net_balance',
      title: L10N.INSIGHT_NET_BALANCE_TITLE,
      caption: L10N.INSIGHT_NET_BALANCE_CAPTION,
      type: 'net',
      value,
      meta: {
        expenses: currentExpenses,
        incomes: currentIncomes,
        pendingExpenses,
        pendingIncomes,
        projected: value + pendingIncomes - pendingExpenses,
      },
      tone: value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral',
    });
  }

  const daysLeft = daysInMonth - elapsedDay;
  const historyKeys = previousKeys(HISTORY_MONTHS).filter(
    (key) => monthTotal(key) > 0 && daysInMonthFromKey(key) > elapsedDay,
  );
  const remainders = historyKeys.map((key) => Math.max(0, monthTotal(key) - monthToDate(key)));
  const historyRemainder = daysLeft > 0 && remainders.length >= 2 ? median(remainders) : undefined;

  let remainder;
  let method;
  if (historyRemainder !== undefined) {
    remainder = Math.max(historyRemainder, pendingExpenses);
    method = 'history';
  } else if (currentExpenses > 0 && elapsedDay >= MIN_LINEAR_DAY) {
    remainder = (currentExpenses / elapsedDay) * daysLeft + pendingExpenses;
    method = 'linear';
  } else if (pendingExpenses > 0 && elapsedDay >= MIN_LINEAR_DAY) {
    remainder = pendingExpenses;
    method = 'scheduled';
  }

  if (method && (currentExpenses > 0 || remainder > 0)) {
    insights.push({
      id: 'spending_pace',
      title: L10N.INSIGHT_SPENDING_PACE_TITLE,
      caption: L10N.INSIGHT_SPENDING_PACE_CAPTION,
      type: 'pace',
      value: currentExpenses + remainder,
      meta: {
        day: elapsedDay,
        daysInMonth,
        method,
        pendingExpenses,
        projected: currentExpenses + remainder,
        remainder,
        samples: remainders.length,
        spent: currentExpenses,
      },
      tone: 'neutral',
    });
  }

  const topIds = new Set(topCategories.map(({ category }) => category));
  const scaleRef = Math.max(currentExpenses, baselineToDate);
  const topMover = Object.keys(currentCategories)
    .concat(baselineKeys.flatMap((key) => Object.keys(months.get(key)?.categoriesToDate || {})))
    .filter((category, index, list) => list.indexOf(category) === index)
    .filter((category) => !topIds.has(Number(category)))
    .map((category) => {
      const amount = currentCategories[category] || 0;
      const avg = categoryBaseline(category);
      return {
        amount,
        avg,
        category: Number(category),
        delta: avg > 0 ? percentDelta(amount, avg) : 0,
        label: categoryLabel(category),
      };
    })
    .filter(
      ({ amount, avg, delta }) =>
        avg > 0 && Math.abs(delta) >= MIN_MOVER_DELTA && Math.max(amount, avg) >= scaleRef * MIN_MOVER_SHARE,
    )
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];

  if (topMover) {
    const delta = Math.round(topMover.delta);

    insights.push({
      id: 'top_mover',
      title: L10N.INSIGHT_TOP_MOVER_TITLE,
      caption: `${topMover.label} ${baselineCaption}`,
      type: 'mover',
      value: delta,
      valueLabel: formatPercentAbs(delta),
      meta: { avg: topMover.avg, current: topMover.amount },
      tone: delta > 0 ? 'negative' : 'positive',
    });
  }

  return insights;
};
