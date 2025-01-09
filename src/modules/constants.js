import { Platform } from 'react-native';

import PKG from '../../package.json';

// eslint-disable-next-line no-undef
const IS_DEV = __DEV__;
const MS_IN_DAY = 1000 * 24 * 60 * 60;
const MS_IN_WEEK = MS_IN_DAY * 7;

export const C = {
  BUSY_PRESS_MS: 2500,

  COLOR: {
    USD: '#4CAF50',
    EUR: '#1E90FF',
    JPY: '#FF6347',
    GBP: '#FFD700',
    CNY: '#DC143C',
    CAD: '#FF4500',
    AUD: '#32CD32',
    SGD: '#4682B4',
    HKD: '#8A2BE2',
    BTC: '#FF8C00',
    ETH: '#6A5ACD',
    KRW: '#00CED1',
    MXN: '#228B22',
    MYR: '#8B0000',
    RUB: '#B22222',
    THB: '#FF1493',
    VND: '#FF69B4',
    XAU: '#DAA520',
    XAG: '#C0C0C0',
  },

  CURRENCY: 'USD',

  DELAY_PRESS_MS: 500,

  // ENDPOINT: IS_DEV ? 'http://localhost:8080' : 'https://ledgernode.soyjavi.com',
  ENDPOINT: 'https://ledgernode.soyjavi.com',

  EXPENSE_AS_INVESTMENT: 5,

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
  IS_WEB: Platform.OS === 'web',

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

  TX: {
    TYPE: {
      EXPENSE: 0,
      INCOME: 1,
      TRANSFER: 2,
    },
  },

  VERSION: PKG.version,
};
