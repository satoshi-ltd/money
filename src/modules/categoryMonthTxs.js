import { isInternalTransfer } from './isInternalTransfer';
import { monthIndex } from './monthIndex';

export const isCategoryEntry = (tx = {}, { category, type } = {}) =>
  tx.category === category && tx.type === type && !isInternalTransfer(tx);

// The sheet's count and the panel's rows must both come from this filter, or the count lies.
export const categoryMonthTxs = (txs = [], { category, month, type, year } = {}) => {
  const target = year * 12 + month;
  return txs.filter((tx) => isCategoryEntry(tx, { category, type }) && monthIndex(tx.timestamp) === target);
};
