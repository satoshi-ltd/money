import { C } from './constants';

const { CURRENCY } = C;

const CACHE = new WeakMap();

const memoOf = (rates) => {
  let memo = CACHE.get(rates);
  if (!memo) {
    memo = { keys: Object.keys(rates).sort(), resolved: new Map() };
    CACHE.set(rates, memo);
  }
  return memo;
};

const getRateKeyByTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
};

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

  const { keys, resolved } = memoOf(rates);
  if (!keys.length) return undefined;

  const date = timestamp ? new Date(timestamp) : undefined;
  const monthId = date ? date.getFullYear() * 12 + date.getMonth() : undefined;
  const cacheKey = monthId !== undefined ? `${currency}|${monthId}` : currency;

  let key = resolved.get(cacheKey);
  if (key === undefined) {
    const targetKey = date ? getRateKeyByTimestamp(timestamp) : undefined;
    key =
      (timestamp
        ? findHistoricalKeyWithCurrency(keys, rates, currency, targetKey)
        : findLatestKeyWithCurrency(keys, rates, currency)) ?? null;
    resolved.set(cacheKey, key);
  }
  if (key === null) return undefined;

  const rate = rates[key][currency];
  return Number.isFinite(rate) && rate !== 0 ? value / rate : undefined;
};
