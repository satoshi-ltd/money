import { dailyNet } from '../dailyNet';
import { C } from '../constants';

const {
  TX: {
    TYPE: { EXPENSE, INCOME, TRANSFER },
  },
} = C;

const OPTIONS = { baseCurrency: 'EUR', rates: {} };

describe('modules/dailyNet', () => {
  test('nets incomes against expenses', () => {
    const txs = [
      { type: INCOME, currency: 'EUR', value: 2450 },
      { type: EXPENSE, currency: 'EUR', value: 52.3 },
      { type: EXPENSE, currency: 'EUR', value: 12.99 },
    ];

    expect(dailyNet(txs, OPTIONS)).toBeCloseTo(2384.71);
  });

  test('ignores transfers', () => {
    const txs = [
      { type: TRANSFER, currency: 'EUR', value: 500 },
      { type: EXPENSE, currency: 'EUR', value: 10 },
    ];

    expect(dailyNet(txs, OPTIONS)).toBeCloseTo(-10);
  });

  test('converts foreign amounts through the rates table', () => {
    const txs = [{ type: EXPENSE, currency: 'USD', value: 108.49, timestamp: new Date(2026, 1, 22).getTime() }];
    const rates = { '2026-02': { USD: 1.0849 } };

    expect(dailyNet(txs, { baseCurrency: 'EUR', rates })).toBeCloseTo(-100);
  });

  test('skips amounts it cannot convert', () => {
    const txs = [
      { type: EXPENSE, currency: 'THB', value: 900 },
      { type: EXPENSE, currency: 'EUR', value: 5 },
    ];

    expect(dailyNet(txs, OPTIONS)).toBeCloseTo(-5);
  });

  test('returns zero for an empty day', () => {
    expect(dailyNet([], OPTIONS)).toBe(0);
  });
});
