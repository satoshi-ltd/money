import { C } from '../constants';
import { consolidate } from '../../contexts/modules/consolidate';

const { EXPENSE } = C.TX.TYPE;

describe('balance consistency', () => {
  test('uses latest rates for current balance and latest chart point', () => {
    const now = Date.now();
    const state = consolidate({
      settings: { baseCurrency: 'EUR' },
      rates: {
        '2026-01': { USD: 2 },
        '2026-02': { USD: 4 },
      },
      accounts: [{ hash: 'a1', balance: 100, currency: 'USD', timestamp: now, title: 'Wallet' }],
      txs: [],
    });

    expect(state.overall.currentBalance).toBeCloseTo(25, 8);
    expect(state.overall.chartBalance[state.overall.chartBalance.length - 1]).toBeCloseTo(state.overall.currentBalance, 8);
  });

  test('flags an account whose rate is unknown instead of counting it as zero', () => {
    const now = Date.now();
    const state = consolidate({
      settings: { baseCurrency: 'EUR' },
      rates: { '2026-01': { USD: 2 } },
      accounts: [
        { hash: 'a1', balance: 100, currency: 'EUR', timestamp: now, title: 'Wallet' },
        { hash: 'a2', balance: 500, currency: 'GBP', timestamp: now, title: 'Abroad' },
      ],
      txs: [],
    });

    // An account nobody can convert contributes nothing to the total rather than a wrong figure.
    expect(state.overall.currentBalance).toBe(100);
    expect(state.accounts[1].currentBalance).toBe(500);
    expect(state.accounts[1].currentBalanceBase).toBeUndefined();
  });

  test('reads the current month from the date it is given', () => {
    const state = consolidate({
      now: new Date(2026, 1, 10, 12),
      settings: { baseCurrency: 'EUR' },
      rates: {},
      accounts: [{ hash: 'a1', balance: 0, currency: 'EUR', timestamp: new Date(2026, 0, 1).getTime() }],
      txs: [
        { hash: 't1', account: 'a1', category: 1, type: EXPENSE, value: 40, timestamp: new Date(2026, 1, 3).getTime() },
        { hash: 't2', account: 'a1', category: 1, type: EXPENSE, value: 90, timestamp: new Date(2026, 0, 3).getTime() },
      ],
    });

    expect(state.overall.currentMonth.expenses).toBe(40);
  });

  test('keeps negative balances in chart and current balance', () => {
    const now = Date.now();
    const state = consolidate({
      settings: { baseCurrency: 'EUR' },
      rates: {},
      accounts: [{ hash: 'a1', balance: -50, currency: 'EUR', timestamp: now, title: 'Debt' }],
      txs: [],
    });

    expect(state.overall.currentBalance).toBe(-50);
    expect(state.overall.chartBalance[state.overall.chartBalance.length - 1]).toBe(-50);
  });
});
