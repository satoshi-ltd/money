import { getLastRates } from '../getLastRates';

describe('components/InputAmount/getLastRates', () => {
  test('answers the newest month whatever order the months were written in', () => {
    const rates = { '2026-08': { USD: 1 }, '2026-10': { USD: 3 }, '2026-09': { USD: 2 } };

    expect(getLastRates(rates)).toEqual({ USD: 3 });
  });

  test('a year boundary sorts as time, not as text', () => {
    const rates = { '2026-01': { USD: 2 }, '2025-12': { USD: 1 } };

    expect(getLastRates(rates)).toEqual({ USD: 2 });
  });

  test('with no month it answers what it was given, so a lookup on it is simply empty', () => {
    expect(getLastRates({})).toEqual({});
    expect(getLastRates()).toEqual({});
  });
});
