import { C } from './constants';
import { exchange } from './exchange';
import { isInternalTransfer } from './isInternalTransfer';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

// Currency lives on the account, never on the transaction: reading it from the transaction quietly summed
// euros with baht and stamped the base symbol on the result.
export const dailyNet = (txs = [], { accounts = [], baseCurrency, rates = {} } = {}) => {
  const currencyOf = new Map(accounts.map(({ currency, hash }) => [hash, currency]));

  return txs.reduce((total, tx = {}) => {
    const { account, type, value = 0 } = tx;
    if ((type !== EXPENSE && type !== INCOME) || isInternalTransfer(tx)) return total;

    const currency = currencyOf.get(account) || baseCurrency;
    const base = !baseCurrency || currency === baseCurrency ? value : exchange(value, currency, baseCurrency, rates);
    if (!Number.isFinite(base)) return total;

    return total + (type === EXPENSE ? -base : base);
  }, 0);
};
