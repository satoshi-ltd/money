import { C } from './constants';

const { FIXED } = C;

// Figures always show their cents (muted); only currencies without minor units drop them.
export const currencyDecimals = (_value = 0, currency) => (FIXED[currency] !== undefined ? FIXED[currency] : 2);
