import { UUID } from './internal';

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
  title: title.trim(),
  type,
  value: parseFloat(value, 10),
});
