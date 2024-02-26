import { parseDate } from './parseDate';
import { C } from '../../../../modules';

const { STATS_MONTHS_LIMIT } = C;

export const filterTxs = (txs = []) => {
  const now = parseDate();
  const originDate = new Date(now.getFullYear(), now.getMonth() - (STATS_MONTHS_LIMIT - 1), 1, 0, 0);

  return txs.filter((tx) => {
    const { timestamp, value = 0 } = tx;

    return value > 0 && parseDate(timestamp) > originDate;
  });
};
