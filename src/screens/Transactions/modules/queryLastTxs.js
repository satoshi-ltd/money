import { C, groupTxsByDate } from '../../../modules';

const { TRANSACTIONS_PER_PAGE } = C;

export const queryLastTxs = (txs = [], page = 1) =>
  groupTxsByDate([...txs].reverse().slice(0, page * TRANSACTIONS_PER_PAGE));
