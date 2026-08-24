import { scheduledAhead } from '../scheduledAhead';

const AUG_23 = new Date(2026, 7, 23, 10, 0, 0).getTime();

const monthly = (hash, value, type, day, startAt = new Date(2026, 0, 1).getTime()) => ({
  account: 'a1',
  hash,
  pattern: { byMonthDay: day, interval: 1, kind: 'monthly' },
  startAt,
  type,
  value,
});

const accounts = [{ currency: 'EUR', hash: 'a1' }];

describe('modules/scheduledAhead', () => {
  test('only counts what is still due before the month closes', () => {
    const summary = scheduledAhead({
      accounts,
      baseCurrency: 'EUR',
      now: AUG_23,
      scheduledTxs: [monthly('rent', 1200, 0, 28), monthly('gym', 40, 0, 5)],
    });

    expect(summary).toEqual({ charges: 1, credits: 0, net: -1200 });
  });

  test('a salary early next month is not this month, whatever the 30-day window says', () => {
    const summary = scheduledAhead({
      accounts,
      baseCurrency: 'EUR',
      now: AUG_23,
      scheduledTxs: [monthly('salary', 7000, 1, 1)],
    });

    expect(summary).toEqual({ charges: 0, credits: 0, net: 0 });
  });

  test('credits and charges net out, and each occurrence is counted', () => {
    const summary = scheduledAhead({
      accounts,
      baseCurrency: 'EUR',
      now: AUG_23,
      scheduledTxs: [monthly('bonus', 500, 1, 25), monthly('rent', 1200, 0, 28), monthly('phone', 30, 0, 30)],
    });

    expect(summary).toEqual({ charges: 2, credits: 1, net: -730 });
  });

  test('something due today still counts as ahead', () => {
    const summary = scheduledAhead({
      accounts,
      baseCurrency: 'EUR',
      now: AUG_23,
      scheduledTxs: [monthly('today', 100, 0, 23)],
    });

    expect(summary.charges).toBe(1);
  });

  test('a foreign-currency charge is converted to the base currency', () => {
    const summary = scheduledAhead({
      accounts: [{ currency: 'USD', hash: 'a1' }],
      baseCurrency: 'EUR',
      now: AUG_23,
      rates: { '2026-08': { USD: 2 } },
      scheduledTxs: [monthly('usd', 100, 0, 28)],
    });

    expect(summary.net).toBe(-50);
  });

  test('an empty schedule is a zero, not a crash', () => {
    expect(scheduledAhead({ accounts, baseCurrency: 'EUR', now: AUG_23 })).toEqual({
      charges: 0,
      credits: 0,
      net: 0,
    });
  });
});
