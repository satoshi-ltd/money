import { C } from '../../../modules';
import { UUID } from '../../modules/UUID';

const { CURRENCY } = C;

export const parseAccount = ({
  hash,
  balance = 0,
  currency = CURRENCY,
  timestamp = new Date().getTime(),
  title,
} = {}) => ({
  hash: hash || UUID({ entity: 'account', balance, currency, timestamp, title }),
  balance: Number.isFinite(parseFloat(balance, 10)) ? parseFloat(balance, 10) : 0,
  currency,
  timestamp,
  title,
});
