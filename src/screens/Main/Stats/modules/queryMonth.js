import { filterTxs } from './filterTxs';
import { parseDate } from './parseDate';
import { C, exchange, isInternalTransfer, isNonAccountingTx } from '../../../../modules';

const {
  TX: {
    TYPE: { EXPENSE },
  },
} = C;

export default (
  { overall = {}, rates = {}, settings: { baseCurrency } = {}, txs = [], vaults = [] },
  { month, year },
) => {
  const values = { expenses: {}, incomes: {} };
  const rangeTxs = [];
  const currencies = {};

  filterTxs(txs)
    .filter((tx) => !isNonAccountingTx(tx) && !isInternalTransfer(tx))
    .forEach((tx) => {
      const { category, timestamp, type, value, title } = tx;

      const date = parseDate(timestamp);
      const dMonth = date.getMonth();
      const dYear = date.getFullYear();

      if (month === dMonth && year === dYear) {
        const { currency } = vaults.find(({ hash }) => hash === tx.vault) || {};

        const valueExchange = exchange(value, currency, baseCurrency, rates, timestamp);

        const categoryKey = title ? title.toLowerCase().trim() : 'Unknown';

        const keyType = type === EXPENSE ? 'expenses' : 'incomes';

        values[keyType][category] = values[keyType][category] || {};
        values[keyType][category][categoryKey] = (values[keyType][category][categoryKey] || 0) + valueExchange;

        rangeTxs.push(tx);
      }
    });

  vaults.forEach(({ currency, currentBalance: balance, currentBalanceBase: base }) => {
    let item = currencies[currency] || { balance: 0, base: 0 };
    item = { balance: item.balance + balance, base: item.base + base };
    item.weight = (item.base * 100) / overall.currentBalance;

    currencies[currency] = item;
  });

  return values;
};
