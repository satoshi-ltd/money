export const PREMIUM_ENABLED = false;

export const hasPremiumAccess = (subscription = {}) => !PREMIUM_ENABLED || !!subscription?.productIdentifier;
