import { C, groupTxsByDate } from '../../../modules';

const { ITEMS_PER_PAGE } = C;
export const query = (txs = [], page = 2) => groupTxsByDate([...txs].reverse().slice(0, ITEMS_PER_PAGE * page));
