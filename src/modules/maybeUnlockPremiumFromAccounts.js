import { PREMIUM_ENABLED } from './premium';

export const maybeUnlockPremiumFromAccounts = ({ accounts = [], subscription = {} } = {}) => {
  if (!PREMIUM_ENABLED) return { shouldUnlock: false };

  const list = Array.isArray(accounts) ? accounts : [];
  const hasBtc = list.some((a) => a?.currency === 'BTC');
  const isPremium = !!subscription?.productIdentifier;
  return { shouldUnlock: hasBtc && !isPremium };
};

