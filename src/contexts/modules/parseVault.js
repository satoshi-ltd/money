import { UUID } from './internal';
import { C } from '../../modules';

const { CURRENCY } = C;

export const parseVault = ({
  hash,
  balance = 0,
  currency = CURRENCY,
  timestamp = new Date().getTime(),
  title,
} = {}) => ({
  hash: hash || UUID({ entity: 'account', balance, currency, timestamp, title }),
  balance: parseFloat(balance, 10),
  currency,
  timestamp,
  title,
});
