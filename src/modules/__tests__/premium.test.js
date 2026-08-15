import { hasPremiumAccess, PREMIUM_ENABLED } from '../premium';
import { maybeUnlockPremiumFromAccounts } from '../maybeUnlockPremiumFromAccounts';

describe('modules/premium', () => {
  test('every feature is open to everyone while subscriptions are off', () => {
    expect(PREMIUM_ENABLED).toBe(false);
    expect(hasPremiumAccess()).toBe(true);
    expect(hasPremiumAccess({})).toBe(true);
    expect(hasPremiumAccess({ productIdentifier: undefined })).toBe(true);
  });

  test('nothing tries to unlock anything, so no purchase notification fires', () => {
    expect(maybeUnlockPremiumFromAccounts({ accounts: [{ currency: 'BTC' }], subscription: {} })).toEqual({
      shouldUnlock: false,
    });
  });
});
