const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'at',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

const tokenize = (title = '') => {
  if (!title || typeof title !== 'string') return [];
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
};

const ensureStatsBucket = (stats, type, word) => {
  if (!stats[type]) stats[type] = {};
  if (!stats[type][word]) stats[type][word] = { total: 0, categories: {} };
  return stats[type][word];
};

const buildRuleForWord = (bucket, { minCount = 3, minRatio = 0.8 } = {}) => {
  if (!bucket) return undefined;
  const categories = bucket.categories || {};
  let topCategory;
  let topCount = 0;
  Object.keys(categories).forEach((category) => {
    const count = categories[category] || 0;
    if (count > topCount) {
      topCount = count;
      topCategory = category;
    }
  });

  if (!topCategory) return undefined;
  if (topCount < minCount) return undefined;
  if (bucket.total > 0 && topCount / bucket.total < minRatio) return undefined;

  return Number(topCategory);
};

export const buildAutoCategoryCatalog = (txs = [], options = {}) => {
  const stats = {};
  txs.forEach(({ title, type, category }) => {
    if (category === undefined || category === null) return;
    const words = tokenize(title);
    if (!words.length) return;
    words.forEach((word) => {
      const bucket = ensureStatsBucket(stats, type, word);
      bucket.total += 1;
      bucket.categories[category] = (bucket.categories[category] || 0) + 1;
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

export const learnAutoCategory = (catalog, { title, type, category }, options = {}) => {
  const stats = { ...(catalog?.stats || {}) };
  const rules = { ...(catalog?.rules || {}) };

  const words = tokenize(title);
  if (!words.length) return catalog;

  words.forEach((word) => {
    const bucket = ensureStatsBucket(stats, type, word);
    bucket.total += 1;
    bucket.categories[category] = (bucket.categories[category] || 0) + 1;
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

export const suggestCategory = (catalog, { title, type }) => {
  const rules = catalog?.rules || {};
  const words = tokenize(title);
  if (!words.length) return undefined;

  const typeRules = rules[type] || {};
  const stats = catalog?.stats?.[type] || {};
  let bestCategory;
  let bestScore = 0;

  words.forEach((word) => {
    const category = typeRules[word];
    if (category === undefined) return;
    const bucket = stats[word];
    const score = bucket?.categories?.[category] || 1;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestCategory;
};
