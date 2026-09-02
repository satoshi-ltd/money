import { filterTxs } from './filterTxs';
import { parseDate } from './parseDate';
import { C, exchange, getMonthDiff, isInternalTransfer } from '../../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

// A quarter of the range, never under three: zoomed out the trend reads over more months, so the dotted line
// means the same thing at every range instead of covering half of 6M and a tenth of All.
const trendWindow = (months) => Math.max(3, Math.round(months / 4));

// Trailing and over the full history: the newest point is the one being read, so it gets a full window, and a
// 6M view borrows the months before it instead of clipping its own left edge.
const trendOf = (values = [], window) =>
  values.map((_value, index) => {
    const slice = values.slice(Math.max(0, index - window + 1), index + 1);
    return slice.reduce((total, entry) => total + entry, 0) / slice.length;
  });

// Both series are padded and sliced the same way, or the dotted line reads against the wrong months.
const windowOf = (values = [], length) => {
  if (values.length >= length) return values.slice(values.length - length);

  const next = Array(length).fill(0);
  values.forEach((value, index) => (next[index + (length - values.length)] = value));
  return next;
};

export default (
  { accounts = [], overall: { chartBalance = [] } = {}, rates = {}, settings: { baseCurrency } = {}, txs = [] },
  monthsLimit = STATS_MONTHS_LIMIT,
) => {
  let effectiveLimit = monthsLimit === 0 ? 0 : monthsLimit || STATS_MONTHS_LIMIT;
  if (effectiveLimit <= 0) {
    effectiveLimit = chartBalance.length || STATS_MONTHS_LIMIT;
  }

  const chart = {
    balance: windowOf(chartBalance, effectiveLimit),
    trend: windowOf(trendOf(chartBalance, trendWindow(effectiveLimit)), effectiveLimit),
    expenses: new Array(effectiveLimit).fill(0),
    incomes: new Array(effectiveLimit).fill(0),
    transfers: new Array(effectiveLimit).fill(0),
  };
  const now = parseDate();
  const originDate = new Date(now.getFullYear(), now.getMonth() - effectiveLimit, 1, 0, 0);

  const accountsCurrency = {};
  accounts.forEach(({ currency, hash }) => (accountsCurrency[hash] = currency));

  filterTxs(txs, effectiveLimit).forEach((tx) => {
    const { timestamp, type, value } = tx;
    const currency = accountsCurrency[tx.account];

    const valueExchange = exchange(value, currency, baseCurrency, rates, timestamp);
    if (!Number.isFinite(valueExchange)) return;
    const monthIndex = getMonthDiff(originDate, parseDate(timestamp)) - 1;
    if (monthIndex < 0 || monthIndex >= effectiveLimit) return;

    if (isInternalTransfer(tx)) {
      if (type === EXPENSE) chart['transfers'][monthIndex] += valueExchange;
      // Marked by hand as money that moved rather than money earned or spent: it belongs to the balance, not here.
    } else if (!tx.meta?.moved) {
      chart[type === EXPENSE ? 'expenses' : 'incomes'][monthIndex] += valueExchange;
    }
  });

  return chart;
};
