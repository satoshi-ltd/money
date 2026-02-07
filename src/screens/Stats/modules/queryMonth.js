import { filterTxs } from './filterTxs';
import { parseDate } from './parseDate';
import { C, exchange, isInternalTransfer } from '../../../modules';

const {
  STATS_MONTHS_LIMIT,
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

export default (
  { accounts = [], overall = {}, rates = {}, settings: { baseCurrency } = {}, txs = [] },
  index,
  monthsLimit = STATS_MONTHS_LIMIT,
) => {
  let effectiveLimit = monthsLimit === 0 ? 0 : monthsLimit || STATS_MONTHS_LIMIT;
  if (effectiveLimit <= 0) {
    effectiveLimit = overall?.chartBalance?.length || STATS_MONTHS_LIMIT;
  }
  const today = new Date();
  today.setMonth(today.getMonth() - (effectiveLimit - index - 1));
  const month = today.getMonth();
  const year = today.getFullYear();

  const values = { expenses: {}, incomes: {} };
  const accountCurrencyByHash = {};
  accounts.forEach(({ hash, currency }) => {
    if (!hash) return;
    accountCurrencyByHash[hash] = currency;
  });

  filterTxs(txs, effectiveLimit)
    .filter((tx) => !isInternalTransfer(tx))
    .forEach((tx) => {
      const { category, timestamp, type, value, title } = tx;

      const date = parseDate(timestamp);
      const dMonth = date.getMonth();
      const dYear = date.getFullYear();

      if (month === dMonth && year === dYear) {
        const currency = accountCurrencyByHash[tx.account];

        const valueExchange = exchange(value, currency, baseCurrency, rates, timestamp);

        const categoryKey = title ? title.toLowerCase().trim() : 'Unknown';

        const keyType = type === EXPENSE ? 'expenses' : 'incomes';

        values[keyType][category] = values[keyType][category] || {};
        values[keyType][category][categoryKey] = (values[keyType][category][categoryKey] || 0) + valueExchange;
      }
    });

  return values;
};
