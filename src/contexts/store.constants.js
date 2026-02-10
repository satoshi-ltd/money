import { getFingerprint } from './modules/getFingerprint';
import { C } from '../modules';

const { CURRENCY } = C;

const SCHEMA_VERSION = 3;

const DEFAULTS = {
  settings: {
    baseCurrency: CURRENCY,
    fingerprint: getFingerprint(),
    language: undefined,
    maskAmount: false,
    onboarded: false,
    pin: undefined,
    reminders: [1],
    // Local-only user profile collected via onboarding survey (opt-in lead capture).
    userProfile: {
      version: 1,
      answers: {},
      completedAt: undefined,
    },
    marketingLead: {
      email: '',
      consent: false,
      sentAt: undefined,
      remote: undefined,
    },
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
