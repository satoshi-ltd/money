import { C } from './constants';

const { CURRENCY } = C;

const getRateKeyByTimestamp = (timestamp) => new Date(timestamp).toISOString().slice(0, 7);

const findLatestKeyWithCurrency = (keys = [], rates = {}, currency) => {
  for (let index = keys.length - 1; index >= 0; index -= 1) {
    const key = keys[index];
    if (rates?.[key]?.[currency]) return key;
  }
  return undefined;
};

const findHistoricalKeyWithCurrency = (keys = [], rates = {}, currency, targetKey) => {
  if (!targetKey) return findLatestKeyWithCurrency(keys, rates, currency);

  for (let index = keys.length - 1; index >= 0; index -= 1) {
    const key = keys[index];
    if (key <= targetKey && rates?.[key]?.[currency]) return key;
  }

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (rates?.[key]?.[currency]) return key;
  }

  return undefined;
};

export const exchange = (value = 0, currency = 'EUR', baseCurrency = CURRENCY, rates = {}, timestamp) => {
  if (currency === baseCurrency || value === 0) return value;

  const keys = Object.keys(rates).sort();
  if (!keys.length) return 0;

  const targetKey = timestamp ? getRateKeyByTimestamp(timestamp) : undefined;
  const key = timestamp
    ? findHistoricalKeyWithCurrency(keys, rates, currency, targetKey)
    : findLatestKeyWithCurrency(keys, rates, currency);
  if (!key) return 0;

  return value / rates[key][currency];
};
