import { groupTxsByDate } from '../../../modules';

const ITEMS_PER_PAGE = 20;

export const query = (txs = [], page = 1) => groupTxsByDate([...txs].reverse().slice(0, page * ITEMS_PER_PAGE));
