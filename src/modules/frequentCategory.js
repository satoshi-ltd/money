import { isInternalTransfer } from './isInternalTransfer';

const tally = (txs = []) =>
  txs.reduce((counts, { category }) => {
    if (category === undefined) return counts;
    return { ...counts, [category]: (counts[category] || 0) + 1 };
  }, {});

const top = (counts) => {
  const [best] = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return best ? Number(best[0]) : undefined;
};

export const frequentCategory = ({ account, txs = [], type } = {}) => {
  const eligible = txs.filter((tx) => tx.type === type && !isInternalTransfer(tx));
  if (!eligible.length) return undefined;

  const own = account ? eligible.filter((tx) => tx.account === account) : [];

  return top(tally(own.length ? own : eligible));
};
