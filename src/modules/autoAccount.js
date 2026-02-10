import { tokenizeTitle } from './autoTokens';

const ensureStatsBucket = (stats, type, word) => {
  if (!stats[type]) stats[type] = {};
  if (!stats[type][word]) stats[type][word] = { total: 0, accounts: {} };
  return stats[type][word];
};

const buildRuleForWord = (bucket, { minCount = 3, minRatio = 0.8 } = {}) => {
  if (!bucket) return undefined;
  const accounts = bucket.accounts || {};
  let topAccount;
  let topCount = 0;
  Object.keys(accounts).forEach((accountHash) => {
    const count = accounts[accountHash] || 0;
    if (count > topCount) {
      topCount = count;
      topAccount = accountHash;
    }
  });

  if (!topAccount) return undefined;
  if (topCount < minCount) return undefined;
  if (bucket.total > 0 && topCount / bucket.total < minRatio) return undefined;

  return topAccount;
};

const isMeaningfulTitle = (title) =>
  typeof title === 'string' && title.trim() !== '' && title.trim().toLowerCase() !== 'transaction';

export const buildAutoAccountCatalog = (txs = [], options = {}) => {
  const stats = {};
  txs.forEach(({ title, type, account }) => {
    if (!account) return;
    if (!isMeaningfulTitle(title)) return;
    const words = tokenizeTitle(title);
    if (!words.length) return;
    words.forEach((word) => {
      const bucket = ensureStatsBucket(stats, type, word);
      bucket.total += 1;
      bucket.accounts[account] = (bucket.accounts[account] || 0) + 1;
    });
  });

  const rules = {};
  Object.keys(stats).forEach((type) => {
    rules[type] = {};
    Object.keys(stats[type]).forEach((word) => {
      const rule = buildRuleForWord(stats[type][word], options);
      if (rule !== undefined) rules[type][word] = rule;
    });
  });

  return {
    rules,
    stats,
    updatedAt: Date.now(),
  };
};

export const learnAutoAccount = (catalog, { title, type, account }, options = {}) => {
  if (!account) return catalog;
  if (!isMeaningfulTitle(title)) return catalog;

  const stats = { ...(catalog?.stats || {}) };
  const rules = { ...(catalog?.rules || {}) };

  const words = tokenizeTitle(title);
  if (!words.length) return catalog;

  words.forEach((word) => {
    const bucket = ensureStatsBucket(stats, type, word);
    bucket.total += 1;
    bucket.accounts[account] = (bucket.accounts[account] || 0) + 1;
  });

  if (!rules[type]) rules[type] = {};
  words.forEach((word) => {
    const rule = buildRuleForWord(stats[type][word], options);
    if (rule !== undefined) rules[type][word] = rule;
  });

  return {
    rules,
    stats,
    updatedAt: Date.now(),
  };
};

export const suggestAccount = (catalog, { title, type }) => {
  const rules = catalog?.rules || {};
  const words = tokenizeTitle(title);
  if (!words.length) return undefined;

  // Prefer current tx type but allow fallback to other types.
  // Account usage usually overlaps across expense/income, unlike categories.
  const typeKey = type !== undefined && type !== null ? String(type) : undefined;
  const types = [];
  if (typeKey !== undefined && rules[typeKey]) types.push(typeKey);
  Object.keys(rules).forEach((key) => {
    if (key !== typeKey) types.push(key);
  });

  let bestAccount;
  let bestScore = 0;

  types.forEach((t) => {
    const typeRules = rules[t] || {};
    const stats = catalog?.stats?.[t] || {};

    words.forEach((word) => {
      const accountHash = typeRules[word];
      if (accountHash === undefined) return;
      const bucket = stats[word];
      const score = bucket?.accounts?.[accountHash] || 1;
      if (score > bestScore) {
        bestScore = score;
        bestAccount = accountHash;
      }
    });
  });

  return bestAccount;
};
