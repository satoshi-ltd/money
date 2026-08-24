import { C } from './constants';
import { exchange } from './exchange';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

export const dailyNet = (txs = [], { baseCurrency, rates = {} } = {}) =>
  txs.reduce((total, { currency, timestamp, type, value = 0 } = {}) => {
    if (type !== EXPENSE && type !== INCOME) return total;

    const base =
      !currency || !baseCurrency || currency === baseCurrency
        ? value
        : exchange(value, currency, baseCurrency, rates, timestamp);
    if (!Number.isFinite(base)) return total;

    return total + (type === EXPENSE ? -base : base);
  }, 0);
