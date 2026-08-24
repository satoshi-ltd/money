import { C } from './constants';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

export const monthFlow = (txs = [], now = Date.now()) => {
  const date = new Date(now);
  const month = date.getMonth();
  const year = date.getFullYear();

  return txs.reduce(
    (totals, { timestamp, type, value = 0 } = {}) => {
      const txDate = new Date(timestamp);
      if (txDate.getMonth() !== month || txDate.getFullYear() !== year) return totals;
      if (type === INCOME) totals.incomes += value;
      else if (type === EXPENSE) totals.expenses += value;
      return totals;
    },
    { incomes: 0, expenses: 0 },
  );
};
