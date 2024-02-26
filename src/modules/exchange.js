import { C } from './constants';

const { CURRENCY } = C;

export const exchange = (value = 0, currency = 'EUR', baseCurrency = CURRENCY, rates = {}, timestamp) => {
  if (currency === baseCurrency || value === 0) return value;

  const keys = Object.keys(rates);
  if (!keys.length) return 0;

  const lastKey = keys[keys.length - 1];
  let key;

  if (timestamp) key = new Date(timestamp).toISOString().substr(0, 7);
  if (!timestamp && !keys.includes(key)) key = lastKey;

  if (!rates[key] || !rates[key][currency]) {
    const keyIndex = keys.indexOf(key);
    key = lastKey;

    keys.some((item, index) => {
      if (index > keyIndex && rates[item][currency]) {
        key = item;
        return true;
      }
      return false;
    });
  }

  return value / rates[key][currency];
};
