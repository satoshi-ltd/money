import { parseDate } from './parseDate';
import { C } from '../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export const filterTxs = (txs = [], monthsLimit = STATS_MONTHS_LIMIT) => {
  const now = parseDate();
  const effectiveLimit = monthsLimit === 0 ? 0 : monthsLimit || STATS_MONTHS_LIMIT;
  const originDate =
    effectiveLimit > 0 ? new Date(now.getFullYear(), now.getMonth() - (effectiveLimit - 1), 1, 0, 0) : undefined;

  return txs.filter((tx) => {
    const { timestamp, value = 0 } = tx;
    if (value <= 0) return false;
    if (!originDate) return true;

    return parseDate(timestamp) >= originDate;
  });
};
