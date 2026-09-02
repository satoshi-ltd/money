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
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - (effectiveLimit - index - 1), 1);
  const month = target.getMonth();
  const year = target.getFullYear();

  const values = { expenses: {}, incomes: {} };
  const accountCurrencyByHash = {};
  accounts.forEach(({ hash, currency }) => {
    if (!hash) return;
    accountCurrencyByHash[hash] = currency;
  });

  filterTxs(txs, effectiveLimit)
    .filter((tx) => !isInternalTransfer(tx) && !tx.meta?.moved)
    .forEach((tx) => {
      const { category, timestamp, type, value, title } = tx;

      const date = parseDate(timestamp);
      const dMonth = date.getMonth();
      const dYear = date.getFullYear();

      if (month === dMonth && year === dYear) {
        const currency = accountCurrencyByHash[tx.account];

        const valueExchange = exchange(value, currency, baseCurrency, rates, timestamp);
        if (!Number.isFinite(valueExchange)) return;

        const categoryKey = title ? title.toLowerCase().trim() : 'Unknown';

        const keyType = type === EXPENSE ? 'expenses' : 'incomes';

        values[keyType][category] = values[keyType][category] || {};
        values[keyType][category][categoryKey] = (values[keyType][category][categoryKey] || 0) + valueExchange;
      }
    });

  return values;
};
