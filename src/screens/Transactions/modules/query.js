import { groupTxsByDate } from '../../../modules';

export const query = (txs = [], scroll = false) => groupTxsByDate([...txs].reverse().slice(0, scroll ? 256 : 16));
