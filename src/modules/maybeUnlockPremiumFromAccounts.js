export const maybeUnlockPremiumFromAccounts = ({ accounts = [], subscription = {} } = {}) => {
  const list = Array.isArray(accounts) ? accounts : [];
  const hasBtc = list.some((a) => a?.currency === 'BTC');
  const isPremium = !!subscription?.productIdentifier;
  return { shouldUnlock: hasBtc && !isPremium };
};

