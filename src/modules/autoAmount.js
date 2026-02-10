import { tokenizeTitle } from './autoTokens';

const ensureStatsBucket = (stats, type, account, word) => {
  if (!stats[type]) stats[type] = {};
  if (!stats[type][account]) stats[type][account] = {};
  if (!stats[type][account][word]) stats[type][account][word] = { total: 0, amounts: {} };
  return stats[type][account][word];
};

const normalizeAmountKey = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;

  // Do not coerce to a fixed decimal precision; preserve the stored value.
  // This avoids inventing cents for JPY/IDR and avoids truncating BTC-like precision.
  return String(n);
};

const isMeaningfulTitle = (title) =>
  typeof title === 'string' && title.trim() !== '' && title.trim().toLowerCase() !== 'transaction';

const buildStableRule = (bucket, { minCount = 3, minRatio = 0.9 } = {}) => {
  if (!bucket) return undefined;

  const amounts = bucket.amounts || {};
  let topAmount;
  let topCount = 0;
  Object.keys(amounts).forEach((amountKey) => {
    const count = amounts[amountKey] || 0;
    if (count > topCount) {
      topCount = count;
      topAmount = amountKey;
    }
  });

  if (!topAmount) return undefined;
  if (topCount < minCount) return undefined;
  if (bucket.total > 0 && topCount / bucket.total < minRatio) return undefined;

  return topAmount;
};

export const buildAutoAmountCatalog = (txs = [], options = {}) => {
  const stats = {};
  txs.forEach(({ title, type, account, value }) => {
    if (!account) return;
    if (!isMeaningfulTitle(title)) return;
    const amountKey = normalizeAmountKey(value);
    if (!amountKey) return;

    const words = tokenizeTitle(title);
    if (!words.length) return;

    words.forEach((word) => {
      const bucket = ensureStatsBucket(stats, type, account, word);
      bucket.total += 1;
      bucket.amounts[amountKey] = (bucket.amounts[amountKey] || 0) + 1;
    });
  });

  const rules = {};
  Object.keys(stats).forEach((type) => {
    rules[type] = {};
    Object.keys(stats[type]).forEach((account) => {
      rules[type][account] = {};
      Object.keys(stats[type][account]).forEach((word) => {
        const rule = buildStableRule(stats[type][account][word], options);
        if (rule !== undefined) rules[type][account][word] = rule;
      });
    });
  });

  return { rules, stats, updatedAt: Date.now() };
};

export const learnAutoAmount = (catalog, { title, type, account, value }, options = {}) => {
  if (!account) return catalog;
  if (!isMeaningfulTitle(title)) return catalog;
  const amountKey = normalizeAmountKey(value);
  if (!amountKey) return catalog;

  const stats = { ...(catalog?.stats || {}) };
  const rules = { ...(catalog?.rules || {}) };

  const words = tokenizeTitle(title);
  if (!words.length) return catalog;

  words.forEach((word) => {
    const bucket = ensureStatsBucket(stats, type, account, word);
    bucket.total += 1;
    bucket.amounts[amountKey] = (bucket.amounts[amountKey] || 0) + 1;
  });

  if (!rules[type]) rules[type] = {};
  if (!rules[type][account]) rules[type][account] = {};

  words.forEach((word) => {
    const rule = buildStableRule(stats[type]?.[account]?.[word], options);
    if (rule !== undefined) rules[type][account][word] = rule;
  });

  return { rules, stats, updatedAt: Date.now() };
};

export const suggestAmount = (catalog, { title, type, account }) => {
  const rules = catalog?.rules || {};
  if (!account) return undefined;

  const words = tokenizeTitle(title);
  if (!words.length) return undefined;

  const typeRules = rules[type] || {};
  const accountRules = typeRules[account] || {};
  if (!accountRules) return undefined;

  const stats = catalog?.stats?.[type]?.[account] || {};
  let bestAmount;
  let bestScore = 0;

  words.forEach((word) => {
    const amountKey = accountRules[word];
    if (amountKey === undefined) return;
    const bucket = stats[word];
    const score = bucket?.amounts?.[amountKey] || 1;
    if (score > bestScore) {
      bestScore = score;
      bestAmount = amountKey;
    }
  });

  return bestAmount;
};
