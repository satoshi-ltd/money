import { getFingerprint } from './modules';
import { C } from '../modules';

const { CURRENCY } = C;

const SCHEMA_VERSION = 2;

const DEFAULTS = {
  settings: {
    baseCurrency: CURRENCY,
    fingerprint: getFingerprint(),
    language: undefined,
    maskAmount: false,
    onboarded: false,
    pin: undefined,
    reminders: [1],
    autoCategory: {
      rules: {},
      stats: {},
      updatedAt: undefined,
    },
    schemaVersion: SCHEMA_VERSION,
    statsRangeMonths: 12,
    theme: 'light',
  },
  rates: {},
  subscription: {},
  accounts: [],
  scheduledTxs: [],
  txs: [],
};

const FILENAME = 'com.satoshi-ltd.money';

export { DEFAULTS, FILENAME, SCHEMA_VERSION };
