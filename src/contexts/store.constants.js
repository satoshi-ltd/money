import { getFingerprint } from './modules';
import { C } from '../modules';

const { CURRENCY } = C;

const DEFAULTS = {
  settings: {
    baseCurrency: CURRENCY,
    fingerprint: getFingerprint(),
    maskAmount: false,
    onboarded: false,
    pin: undefined,
    theme: 'light',
  },
  rates: {},
  subscription: {},
  accounts: [],
  txs: [],
};

const FILENAME = 'com.satoshi-ltd.money';

export { DEFAULTS, FILENAME };
