import { filterTxs } from './filterTxs';
import { parseDate } from './parseDate';
import { C, exchange, getMonthDiff, isInternalTransfer } from '../../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

export default ({
  accounts = [],
  overall: { chartBalance = [] } = {},
  rates = {},
  settings: { baseCurrency } = {},
  txs = [],
}, monthsLimit = STATS_MONTHS_LIMIT) => {
  let effectiveLimit = monthsLimit === 0 ? 0 : monthsLimit || STATS_MONTHS_LIMIT;
  if (effectiveLimit <= 0) {
    effectiveLimit = chartBalance.length || STATS_MONTHS_LIMIT;
  }

  if (chartBalance.length < effectiveLimit) {
    const { length } = chartBalance;
    const next = Array(effectiveLimit).fill(0);
    chartBalance.forEach((value, index) => (next[index + (effectiveLimit - length)] = value));
    chartBalance = next;
  }

  const chart = {
    balance: chartBalance.slice(chartBalance.length - effectiveLimit),
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
    const monthIndex = getMonthDiff(originDate, parseDate(timestamp)) - 1;
    if (monthIndex < 0 || monthIndex >= effectiveLimit) return;

    if (!isInternalTransfer(tx)) {
      chart[type === EXPENSE ? 'expenses' : 'incomes'][monthIndex] += valueExchange;
    } else if (type === EXPENSE) {
      chart['transfers'][monthIndex] += valueExchange;
    }
  });

  return chart;
};
