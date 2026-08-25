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

  EXPENSE_AS_INVESTMENT: 5,

  EVENT: {
    CONFIRM: 'confirm',
    NOTIFICATION: 'notification',
  },

  FIXED: {
    BTC: 8,
    ETH: 4,
    IDR: 0,
    JPY: 0,
    PLN: 0,
    THB: 0,
    XAU: 4,
    XAG: 4,
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
  // Single-glyph forms only. Anything that would collide resolves to its ISO code via currencySymbol().
  // The onboarding picker is drawn from this; every code in SYMBOL belongs to exactly one group.
  CURRENCY_GROUPS: [
    { id: 'GLOBAL', codes: ['USD', 'EUR', 'JPY', 'GBP', 'CHF', 'CNY'] },
    { id: 'AMERICAS', codes: ['CAD', 'BRL', 'MXN'] },
    { id: 'APAC', codes: ['AUD', 'NZD', 'SGD', 'HKD', 'TWD', 'KRW'] },
    { id: 'ASIA', codes: ['INR', 'IDR', 'MYR', 'PHP', 'THB', 'VND'] },
    { id: 'MEA', codes: ['AED', 'TRY'] },
    { id: 'CRYPTO', codes: ['BTC', 'ETH', 'XRP', 'USDT', 'USDC'] },
    { id: 'METAL', codes: ['XAU', 'XAG'] },
  ],

  SYMBOL: {
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
    CHF: 'Fr',
    CNY: '¥',
    CAD: '$',
    BRL: 'R$',
    MXN: '$',
    AUD: '$',
    NZD: '$',
    SGD: '$',
    HKD: '$',
    TWD: 'NT$',
    KRW: '₩',
    INR: '₹',
    IDR: 'Rp',
    MYR: 'RM',
    PHP: '₱',
    THB: '฿',
    VND: '₫',
    AED: 'AED',
    TRY: '₺',
    BTC: Platform.OS === 'android' && Platform.Version < 26 ? 'Ƀ' : '₿',
    ETH: 'Ξ',
    XRP: 'XRP',
    USDT: 'USDT',
    USDC: 'USDC',
    XAU: 'oz',
    XAG: 'oz',
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
