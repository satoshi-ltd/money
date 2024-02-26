import { C } from './constants';

const { FIXED } = C;

export const currencyDecimals = (value = 0, currency) => (value < 10000 ? FIXED[currency] || 2 : 0);
