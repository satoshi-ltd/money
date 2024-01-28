import { UUID } from './internal';

export const parseTx = ({
  hash,
  category,
  timestamp = new Date().getTime(),
  title = 'Transaction',
  type,
  value = 0,
  vault,
} = {}) => ({
  hash: hash || UUID({ entity: 'tx', category, timestamp, title, type, value, vault }),
  category,
  timestamp,
  title: title.trim(),
  type,
  value: parseFloat(value, 10),
  vault,
});
