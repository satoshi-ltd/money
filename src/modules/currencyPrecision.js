import { C } from './constants';

const { FIXED } = C;

export const currencyPrecision = (currency) => (Number.isFinite(FIXED[currency]) ? FIXED[currency] : 2);

export const roundToCurrency = (value, currency) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return undefined;

  const precision = currencyPrecision(currency);
  const shifted = Number(`${amount}e${precision}`);
  if (!Number.isFinite(shifted)) return Math.round(amount * 10 ** precision) / 10 ** precision;

  const rounded = Number(`${Math.round(shifted)}e-${precision}`);

  return Number.isFinite(rounded) ? rounded : amount;
};
