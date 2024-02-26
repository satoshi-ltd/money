import { C } from './constants';

const { CURRENCY, SYMBOL } = C;

const WITHOUT_SYMBOL = ['XAG', 'XAU'];

export const getCurrencySymbol = (currency = CURRENCY) =>
  WITHOUT_SYMBOL.includes(currency) ? '' : SYMBOL[currency] || currency;
