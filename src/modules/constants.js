import { Platform } from 'react-native';

import PKG from '../../package.json';

// eslint-disable-next-line no-undef
const IS_DEV = __DEV__;
const MS_IN_DAY = 1000 * 24 * 60 * 60;
const MS_IN_WEEK = MS_IN_DAY * 7;

export const C = {
  BUSY_PRESS_MS: 2500,

  CURRENCY: 'USD',

  DEFAULT_THEME: 'light',
  DELAY_PRESS_MS: 500,

  // ENDPOINT: IS_DEV ? 'http://localhost:8080' : 'https://ledgernode.soyjavi.com',
  ENDPOINT: 'https://money.satoshi-ltd.com',

  EXPENSE_AS_INVESTMENT: 5,

  EVENT: {
    NOTIFICATION: 'notification',
  },

  FIXED: {
    BTC: 8,
    ETH: 4,
    IDR: 0,
    JPY: 0,
    PLN: 0,
    THB: 0,
    XAU: 0,
    XAG: 0,
  },

  INCOME_AS_INVESTMENT: 2,
  INTERNAL_TRANSFER: 99,
  IS_DEV,
  IS_ANDROID: Platform.OS === 'android',
  IS_IOS: Platform.OS === 'ios',

  LANGUAGE: 'en-EN',

  MS_IN_DAY,
  MS_IN_WEEK,

  PRIVACY_URL: 'https://www.satoshi-ltd.com/privacy-policy/',

  STATS_MONTHS_LIMIT: 12,
  SYMBOL: {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    CNY: '¥',
    CAD: 'CA$',
    AUD: 'AU$',
    SGD: 'S$',
    HKD: 'HK$',
    BTC: Platform.OS === 'android' && Platform.Version < 26 ? 'Ƀ' : '₿',
    ETH: 'Ξ',
    KRW: '₩',
    MXN: 'Mex$',
    MYR: 'RM',
    RUB: '₽',
    THB: '฿',
    VND: '₫',
    XAU: 'gr',
    XAG: 'gr',
  },

  TERMS_URL: 'https://www.satoshi-ltd.com/terms-of-use/',

  TIMEOUT: {
    BUSY: 40,
    GET: 10000,
    POST: 60000,
    CONNECTION: 10000,
    CONNECTION_STABLE: 30000,
    SYNC: 60000,
  },

  TRANSACTIONS_PER_PAGE: 32,

  TX: {
    TYPE: {
      EXPENSE: 0,
      INCOME: 1,
      TRANSFER: 2,
    },
  },

  VERSION: PKG.version,
};
