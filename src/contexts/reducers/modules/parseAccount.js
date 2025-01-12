import { C } from '../../../modules';
import { UUID } from '../../modules';

const { CURRENCY } = C;

export const parseAccount = ({
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
