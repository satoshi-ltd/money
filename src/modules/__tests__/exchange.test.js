import { exchange } from '../exchange';

const RATES = {
  '2026-01': { USD: 2 },
  '2026-02': { USD: 4, JPY: 150 },
};

describe('modules/exchange', () => {
  test('returns the value untouched when no conversion is needed', () => {
    expect(exchange(100, 'EUR', 'EUR', {})).toBe(100);
    expect(exchange(0, 'USD', 'EUR', {})).toBe(0);
  });

  test('converts with the rate of the transaction month', () => {
    expect(exchange(100, 'USD', 'EUR', RATES, new Date(2026, 0, 15).getTime())).toBe(50);
    expect(exchange(100, 'USD', 'EUR', RATES, new Date(2026, 1, 15).getTime())).toBe(25);
  });

  test('falls back to the latest known rate when no timestamp is given', () => {
    expect(exchange(100, 'USD', 'EUR', RATES)).toBe(25);
  });

  test('picks the rate month from the local calendar, like every other month bucket', () => {
    const firstOfFebruary = new Date(2026, 1, 1, 0, 30, 0, 0);

    expect(firstOfFebruary.getMonth()).toBe(1);
    expect(exchange(100, 'USD', 'EUR', RATES, firstOfFebruary.getTime())).toBe(25);
  });

  test('signals an impossible conversion instead of returning zero', () => {
    expect(exchange(100, 'USD', 'EUR', {})).toBeUndefined();
    expect(exchange(100, 'GBP', 'EUR', RATES)).toBeUndefined();
  });

  test('signals a broken rate instead of dividing by it', () => {
    expect(exchange(100, 'USD', 'EUR', { '2026-01': { USD: 0 } })).toBeUndefined();
    expect(exchange(100, 'USD', 'EUR', { '2026-01': { USD: null } })).toBeUndefined();
  });

  test('reuses lookups without mixing values or months', () => {
    expect(exchange(40, 'USD', 'EUR', RATES, new Date(2026, 0, 15).getTime())).toBe(20);
    expect(exchange(80, 'USD', 'EUR', RATES, new Date(2026, 0, 15).getTime())).toBe(40);
    expect(exchange(80, 'USD', 'EUR', RATES, new Date(2026, 1, 15).getTime())).toBe(20);
  });

  test('treats a replacement rates table as a fresh cache', () => {
    expect(exchange(100, 'GBP', 'EUR', RATES)).toBeUndefined();

    const nextRates = { ...RATES, '2026-02': { ...RATES['2026-02'], GBP: 2 } };
    expect(exchange(100, 'GBP', 'EUR', nextRates)).toBe(50);
  });
});
