import { monthlyImpact } from '../monthlyImpact';
import { C } from '../constants';

const {
  TX: {
    TYPE: { EXPENSE, INCOME },
  },
} = C;

const NOW = new Date(2026, 1, 22, 12, 0, 0).getTime();
const START = new Date(2025, 0, 1, 12, 0, 0).getTime();
const ACCOUNTS = [
  { hash: 'eur', currency: 'EUR' },
  { hash: 'usd', currency: 'USD' },
];

const base = { accounts: ACCOUNTS, baseCurrency: 'EUR', now: NOW, rates: {} };

describe('modules/monthlyImpact', () => {
  test('a monthly expense lands once in the next thirty days', () => {
    const scheduledTxs = [
      { account: 'eur', startAt: START, type: EXPENSE, value: 50, pattern: { kind: 'monthly', byMonthDay: 21 } },
    ];

    expect(monthlyImpact({ ...base, scheduledTxs })).toBeCloseTo(-50);
  });

  test('a weekly income counts every occurrence in the window', () => {
    const scheduledTxs = [
      { account: 'eur', startAt: START, type: INCOME, value: 100, pattern: { kind: 'weekly', byWeekday: [1] } },
    ];

    expect(monthlyImpact({ ...base, scheduledTxs })).toBeCloseTo(500);
  });

  test('foreign amounts convert through the rates table', () => {
    const scheduledTxs = [
      { account: 'usd', startAt: START, type: EXPENSE, value: 108.49, pattern: { kind: 'monthly', byMonthDay: 21 } },
    ];
    const rates = { '2026-02': { USD: 1.0849 } };

    expect(monthlyImpact({ ...base, rates, scheduledTxs })).toBeCloseTo(-100);
  });

  test('nets incomes against expenses across the list', () => {
    const scheduledTxs = [
      { account: 'eur', startAt: START, type: INCOME, value: 2450, pattern: { kind: 'monthly', byMonthDay: 21 } },
      { account: 'eur', startAt: START, type: EXPENSE, value: 12.99, pattern: { kind: 'monthly', byMonthDay: 21 } },
    ];

    expect(monthlyImpact({ ...base, scheduledTxs })).toBeCloseTo(2437.01);
  });
});
