import { C } from './constants';

const {
  EXPENSE_AS_INVESTMENT,
  INCOME_AS_INVESTMENT,
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

export const isNonAccountingTx = (tx = {}) =>
  (tx.type === EXPENSE && tx.category === EXPENSE_AS_INVESTMENT) ||
  (tx.type === INCOME && tx.category === INCOME_AS_INVESTMENT);
// export const isNonAccountingTx = (tx = {}) => tx.category === EXPENSE_AS_INVESTMENT;
