import { consolidate } from '../../contexts/modules/consolidate';

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

    expect(state.overall.currentBalance).toBe(100);
    expect(state.overall.hasMissingRate).toBe(true);
    expect(state.accounts[0].hasMissingRate).toBe(false);
    expect(state.accounts[1].hasMissingRate).toBe(true);
    expect(state.accounts[1].currentBalance).toBe(500);
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
