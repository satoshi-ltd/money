const FEATURE = {
  CSV_EXPORT: 'csv_export',
  STATS_ADVANCED_RANGE: 'stats_advanced_range',
};

const PRO_FEATURES = new Set([FEATURE.CSV_EXPORT, FEATURE.STATS_ADVANCED_RANGE]);

const normalizeProductIdentifier = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const isLifetimeProduct = (productIdentifier) => normalizeProductIdentifier(productIdentifier).startsWith('lifetime');

export const getAccessContext = (subscription = {}) => {
  const productIdentifier = normalizeProductIdentifier(subscription?.productIdentifier);
  const unlockedByBtc = subscription?.unlockedBy === 'btc';
  const isPro = !!productIdentifier || unlockedByBtc;

  return {
    isLifetime: isLifetimeProduct(productIdentifier) || unlockedByBtc,
    isPro,
    productIdentifier,
    canAccessFeature: (feature) => {
      if (!feature) return true;
      if (!PRO_FEATURES.has(feature)) return true;
      return isPro;
    },
  };
};

export { FEATURE };
