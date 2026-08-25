import { C } from './constants';

const { FIXED } = C;

const DEFAULT = 2;

// Figures always show their cents (muted); only currencies without minor units drop them. Where a currency
// asks for more than cents, trailing zeros are trimmed: "4.00000000" spends eight characters saying nothing,
// and the two-decimal rhythm that aligns the fiat column is not at stake there.
export const currencyDecimals = (value = 0, currency) => {
  const max = FIXED[currency] !== undefined ? FIXED[currency] : DEFAULT;
  if (max <= DEFAULT) return max;

  const [, decimals = ''] = Math.abs(value).toFixed(max).split('.');
  // Never below cents: dropping to a bare "4" would break the two-decimal rhythm the column reads by.
  return Math.max(DEFAULT, decimals.replace(/0+$/, '').length);
};
