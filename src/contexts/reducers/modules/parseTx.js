import { UUID } from '../../modules';

export const parseTx = ({
  account,
  hash,
  category,
  timestamp = new Date().getTime(),
  title = 'Transaction',
  type,
  value = 0,
} = {}) => ({
  account,
  hash: hash || UUID({ entity: 'tx', category, timestamp, title, type, value, account }),
  category,
  timestamp,
  title: typeof title === 'string' ? title.trim() : 'Transaction',
  type,
  value: Number.isFinite(Number(value)) ? Math.abs(Number(value)) : 0,
});
