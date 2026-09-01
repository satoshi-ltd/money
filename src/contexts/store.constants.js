import { getFingerprint } from './modules/getFingerprint';
import { C } from '../modules';

const { CURRENCY } = C;

const SCHEMA_VERSION = 4;

// Metals came per gram from the backend this build replaced, so a cache written before 4 prices XAU and XAG 31x low.
const RATES_SCHEMA = 4;

const DEFAULTS = {
  settings: {
    baseCurrency: CURRENCY,
    fingerprint: getFingerprint(),
    language: undefined,
    maskAmount: false,
    onboarded: false,
    pin: undefined,
    ratesBaseCurrency: undefined,
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
    autoAccount: {
      rules: {},
      stats: {},
      updatedAt: undefined,
    },
    autoAmount: {
      rules: {},
      stats: {},
      updatedAt: undefined,
    },
    schemaVersion: SCHEMA_VERSION,
    statsRangeMonths: 12,
    theme: 'light',
  },
  rates: {},
  accounts: [],
  scheduledTxs: [],
  txs: [],
};

const FILENAME = 'com.satoshi-ltd.money';

export { DEFAULTS, FILENAME, RATES_SCHEMA, SCHEMA_VERSION };
