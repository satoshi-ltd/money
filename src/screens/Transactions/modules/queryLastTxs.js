import { C, groupTxsByDate } from '../../../modules';

const { TRANSACTIONS_PER_PAGE } = C;

export const queryLastTxs = (txs = [], page = 1) =>
  groupTxsByDate(
    txs
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, page * TRANSACTIONS_PER_PAGE),
  );
