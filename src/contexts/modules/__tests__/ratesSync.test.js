import { isRatesSyncDue, RATES_SYNC_INTERVAL } from '../ratesSync';

const NOW = new Date('2026-08-26T12:00:00Z').getTime();

describe('contexts/modules/ratesSync', () => {
  test('syncs when there is no prior download or it is old', () => {
    expect(isRatesSyncDue({ now: NOW })).toBe(true);
    expect(isRatesSyncDue({ lastRatesUpdate: NOW - RATES_SYNC_INTERVAL, now: NOW })).toBe(true);
  });

  test('does not redownload rates on a fresh foreground', () => {
    expect(isRatesSyncDue({ lastRatesUpdate: NOW - RATES_SYNC_INTERVAL + 1, now: NOW })).toBe(false);
  });

  test('allows an explicit refresh regardless of age', () => {
    expect(isRatesSyncDue({ force: true, lastRatesUpdate: NOW, now: NOW })).toBe(true);
  });
});
