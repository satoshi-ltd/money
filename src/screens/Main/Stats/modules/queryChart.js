import { filterTxs } from './filterTxs';
import { parseDate } from './parseDate';
import { C, exchange, getMonthDiff, isInternalTransfer, isNonAccountingTx } from '../../../../modules';

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
}) => {
  if (chartBalance.length < STATS_MONTHS_LIMIT) {
    const { length } = chartBalance;
    const next = Array(STATS_MONTHS_LIMIT).fill(0);
    chartBalance.forEach((value, index) => (next[index + (STATS_MONTHS_LIMIT - length)] = value));
    chartBalance = next;
  }

  const chart = {
    balance: chartBalance.slice(chartBalance.length - STATS_MONTHS_LIMIT),
    expenses: new Array(STATS_MONTHS_LIMIT).fill(0),
    incomes: new Array(STATS_MONTHS_LIMIT).fill(0),
    investments: new Array(STATS_MONTHS_LIMIT).fill(0),
    transfers: new Array(STATS_MONTHS_LIMIT).fill(0),
  };
  const now = parseDate();
  const originDate = new Date(now.getFullYear(), now.getMonth() - STATS_MONTHS_LIMIT, 1, 0, 0);

  const accountsCurrency = {};
  accounts.forEach(({ currency, hash }) => (accountsCurrency[hash] = currency));

  filterTxs(txs)
    // .filter((tx) => !isNonAccountingTx(tx))
    .forEach((tx) => {
      const { timestamp, type, value } = tx;
      const currency = accountsCurrency[tx.account];

      const valueExchange = exchange(value, currency, baseCurrency, rates, timestamp);
      const monthIndex = getMonthDiff(originDate, parseDate(timestamp)) - 1;

      if (!isInternalTransfer(tx) && !isNonAccountingTx(tx)) {
        chart[type === EXPENSE ? 'expenses' : 'incomes'][monthIndex] += valueExchange;
      } else if (type === EXPENSE) {
        chart[isInternalTransfer(tx) ? 'transfers' : 'investments'][monthIndex] += valueExchange;
      }
    });

  return chart;
};
