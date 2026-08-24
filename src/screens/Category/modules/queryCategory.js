import { exchange, isInternalTransfer } from '../../../modules';

export const AVERAGE_MONTHS = 3;

const indexOf = (date) => date.getFullYear() * 12 + date.getMonth();

const capitalize = (value = '') => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

export const queryCategory = (
  { accounts = [], rates = {}, settings: { baseCurrency } = {}, txs = [] },
  { category, month, type, year } = {},
) => {
  const currencyByHash = new Map(accounts.map(({ currency, hash }) => [hash, currency]));
  const titleByHash = new Map(accounts.map(({ hash, title }) => [hash, title]));
  const target = year * 12 + month;

  const matches = txs
    .filter((tx) => tx.category === category && tx.type === type && (tx.value || 0) > 0 && !isInternalTransfer(tx))
    .map((tx) => {
      const value = exchange(tx.value, currencyByHash.get(tx.account), baseCurrency, rates, tx.timestamp);
      return Number.isFinite(value) ? { ...tx, value } : undefined;
    })
    .filter(Boolean);

  const entries = matches
    .filter(({ timestamp }) => indexOf(new Date(timestamp)) === target)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((tx) => ({ ...tx, account: titleByHash.get(tx.account) }));

  const total = entries.reduce((sum, { value }) => sum + value, 0);

  const byTitle = new Map();
  entries.forEach(({ title, value }) => {
    const key = `${title || ''}`.trim().toLowerCase() || '—';
    const merchant = byTitle.get(key) || { count: 0, title: capitalize(key), value: 0 };
    byTitle.set(key, { ...merchant, count: merchant.count + 1, value: merchant.value + value });
  });
  const merchants = [...byTitle.values()].sort((a, b) => b.value - a.value);

  const oldest = txs.reduce((min, { timestamp }) => Math.min(min, timestamp || Infinity), Infinity);
  const covered = Number.isFinite(oldest) && indexOf(new Date(oldest)) <= target - AVERAGE_MONTHS;
  const average = covered
    ? matches
        .filter(({ timestamp }) => {
          const index = indexOf(new Date(timestamp));
          return index < target && index >= target - AVERAGE_MONTHS;
        })
        .reduce((sum, { value }) => sum + value, 0) / AVERAGE_MONTHS
    : undefined;

  return { average, entries, merchants, total };
};
