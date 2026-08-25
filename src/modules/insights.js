import { C } from './constants';
import { exchange } from './exchange';
import { isInternalTransfer } from './isInternalTransfer';
import { L10N } from './l10n';
import { getOccurrencesBetween } from './recurrence';
import { getScheduledOccurrenceKey, getScheduledOccurrenceKeyFromTx } from './scheduledKey';

const { TX: { TYPE } = {} } = C;

const BASELINE_MONTHS = 3;
const TREND_FLAT_BAND = 5;
const MIN_BASELINE_SHARE = 0.1;
// A share of a full-month median, not of a day-capped one: the floor must not shrink to nothing on day 2.
const MIN_SWING_SHARE = 0.05;
const MIN_SWING_MONTHS = 2;

const monthKey = (date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

const shiftMonthKey = (date, offset) => monthKey(new Date(date.getFullYear(), date.getMonth() - offset, 1));

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sum = (values = []) => values.reduce((total, value) => total + value, 0);

const median = (values = []) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const percentDelta = (value, baseline) => clamp(((value - baseline) / baseline) * 100, -999, 999);


// Two groups of category names: expenses first, incomes second.
const categoryLabel = (category, group = 0) => L10N.CATEGORIES?.[group]?.[category] || `${category}`;

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
      months.set(key, {
        byDay: [],
        categoriesToDate: {},
        creditCategoriesToDate: {},
        expenses: 0,
        expensesToDate: 0,
        incomes: 0,
        incomesToDate: 0,
      });
    return months.get(key);
  };

  const recordedOccurrences = new Set();
  let firstKey;
  let charges = 0;
  let credits = 0;
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
    const amount = exchange(value, currency, baseCurrency, rates);
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
      entry.byDay[date.getDate()] = (entry.byDay[date.getDate()] || 0) + amount;
      if (toDate) {
        entry.expensesToDate += amount;
        if (tx.category !== undefined && tx.category !== null)
          entry.categoriesToDate[tx.category] = (entry.categoriesToDate[tx.category] || 0) + amount;
      } else if (key === currentKey) {
        pendingExpenses += amount;
        charges += 1;
      }
    } else {
      entry.incomes += amount;
      if (toDate) {
        entry.incomesToDate += amount;
        if (tx.category !== undefined && tx.category !== null)
          entry.creditCategoriesToDate[tx.category] = (entry.creditCategoriesToDate[tx.category] || 0) + amount;
      }
      else if (key === currentKey) {
        pendingIncomes += amount;
        credits += 1;
      }
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

      const amount = exchange(value, currency, baseCurrency, rates);
      if (!Number.isFinite(amount)) return;

      if (scheduled.type === TYPE.EXPENSE) {
        pendingExpenses += amount;
        charges += 1;
      } else {
        pendingIncomes += amount;
        credits += 1;
      }
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
  const currentCategories = currentEntry?.categoriesToDate || {};

  const baselineKeys = previousKeys(BASELINE_MONTHS).filter((key) => monthTotal(key) > 0);
  const baselineToDate = median(baselineKeys.map(monthToDate));
  const baselineTotalSum = sum(baselineKeys.map(monthTotal));
  const elapsedShare = baselineTotalSum > 0 ? sum(baselineKeys.map(monthToDate)) / baselineTotalSum : 0;

  const categoryBaseline = (category) =>
    median(baselineKeys.map((key) => months.get(key)?.categoriesToDate?.[category] || 0));

  const insights = [];

  // The lead is emitted even with nothing to compare against: without this branch a new ledger renders the
  // "This month" heading over an empty card, which is every user the onboarding just finished creating.
  const comparable = baselineToDate > 0 && elapsedShare >= MIN_BASELINE_SHARE;
  const delta = comparable ? Math.round(percentDelta(currentExpenses, baselineToDate)) : undefined;

  if (currentExpenses > 0 || comparable) {
    insights.push({
      id: 'spending_trend',
      type: 'trend',
      value: delta,
      meta: {
        baseline: comparable ? baselineToDate : undefined,
        // One band, decided here: the view re-deriving it printed "3% above pace" for a month called flat.
        direction: delta === undefined ? undefined : delta > TREND_FLAT_BAND ? 'over' : delta < -TREND_FLAT_BAND ? 'under' : 'flat',
        day: elapsedDay,
        spent: currentExpenses,
      },
    });
  }

  // Measured in money so the figure and the category name refer to the same thing, and so it can be held
  // against the ink the bar draws. A ratio reconciles with neither, and blows up on a near-zero baseline.
  const fullMonthMedian = median(baselineKeys.map(monthTotal));
  const mover = Object.keys(currentCategories)
    .concat(baselineKeys.flatMap((key) => Object.keys(months.get(key)?.categoriesToDate || {})))
    .filter((category, index, list) => list.indexOf(category) === index)
    .map((category) => ({
      label: categoryLabel(category),
      over: (currentCategories[category] || 0) - categoryBaseline(category),
    }))
    .filter(({ over }) => Math.abs(over) >= fullMonthMedian * MIN_SWING_SHARE)
    .sort((first, second) => Math.abs(second.over) - Math.abs(first.over))[0];

  if (comparable && mover && baselineKeys.length >= MIN_SWING_MONTHS) {
    insights.push({
      id: 'swing',
      type: 'swing',
      value: mover.over,
      meta: { label: mover.label },
    });
  }

  // Income, not net: incomes are counted to date, so a net figure reads deeply negative until payday and
  // flips on one morning with no change in behaviour. What came in only ever goes up.
  // The share is what keeps this honest: a category name alone beside a total claims the whole total came
  // from it, while "Royalties 49%" says where the biggest part came from and that there is a rest.
  const sources = Object.entries(currentEntry?.creditCategoriesToDate || {}).sort((first, second) => second[1] - first[1]);
  const [source] = sources;

  if (currentIncomes > 0 && source) {
    insights.push({
      id: 'incomes',
      type: 'incomes',
      value: currentIncomes,
      meta: {
        label: categoryLabel(source[0], 1),
        // One source is always the whole of it: a 100% beside its own name says nothing twice.
        share: sources.length > 1 ? Math.round((source[1] / currentIncomes) * 100) : undefined,
      },
    });
  }

  if (pendingExpenses > 0 || pendingIncomes > 0) {
    insights.push({
      id: 'scheduled',
      type: 'scheduled',
      value: pendingIncomes - pendingExpenses,
      meta: { pending: charges + credits },
    });
  }

  return insights;
};
