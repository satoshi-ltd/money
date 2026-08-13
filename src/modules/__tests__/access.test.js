import { FEATURE, getAccessContext } from '../access';

describe('modules/access', () => {
  test('treats missing subscription as free tier', () => {
    const access = getAccessContext();

    expect(access.isPro).toBe(false);
    expect(access.canAccessFeature(FEATURE.CSV_EXPORT)).toBe(false);
    expect(access.canAccessFeature('unknown')).toBe(true);
  });

  test('unlocks pro features for any active product identifier', () => {
    const access = getAccessContext({ productIdentifier: 'pro.yearly.v1' });

    expect(access.isPro).toBe(true);
    expect(access.isLifetime).toBe(false);
    expect(access.canAccessFeature(FEATURE.CSV_EXPORT)).toBe(true);
    expect(access.canAccessFeature(FEATURE.STATS_ADVANCED_RANGE)).toBe(true);
  });

  test('keeps btc lifetime unlock as pro even without store product id', () => {
    const access = getAccessContext({ unlockedBy: 'btc' });

    expect(access.isPro).toBe(true);
    expect(access.isLifetime).toBe(true);
    expect(access.canAccessFeature(FEATURE.CSV_EXPORT)).toBe(true);
  });
});
