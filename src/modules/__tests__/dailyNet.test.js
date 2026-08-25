import { dailyNet } from '../dailyNet';
import { C } from '../constants';

const {
  TX: {
    TYPE: { EXPENSE, INCOME, TRANSFER },
  },
} = C;

// The shape the app actually stores: no currency on the transaction, only an account it belongs to.
const ACCOUNTS = [
  { currency: 'EUR', hash: 'eur' },
  { currency: 'THB', hash: 'thb' },
  { currency: 'USD', hash: 'usd' },
];
const RATES = { '2026-08': { EUR: 0.856, THB: 32.6, USD: 1 } };
const OPTIONS = { accounts: ACCOUNTS, baseCurrency: 'USD', rates: RATES };

const tx = (account, type, value, category = 1) => ({ account, category, type, value });

describe('modules/dailyNet', () => {
  test('nets incomes against expenses', () => {
    const txs = [tx('usd', INCOME, 2450), tx('usd', EXPENSE, 52.3), tx('usd', EXPENSE, 12.99)];

    expect(dailyNet(txs, OPTIONS)).toBeCloseTo(2384.71);
  });

  // A day header read "+9,752.93 $" for an income of 9,752.93 EUR, which was 11,389.26 USD.
  test('it converts through the account currency instead of stamping the base symbol on a raw figure', () => {
    expect(dailyNet([tx('eur', INCOME, 9752.93)], OPTIONS)).toBeCloseTo(9752.93 / 0.856, 2);
  });

  test('it never adds two currencies together', () => {
    const mixed = dailyNet([tx('eur', INCOME, 100), tx('thb', EXPENSE, 100)], OPTIONS);

    expect(mixed).toBeCloseTo(100 / 0.856 - 100 / 32.6, 2);
    expect(mixed).not.toBeCloseTo(0, 2);
  });

  test('an internal transfer is not income, here or anywhere else', () => {
    const txs = [tx('eur', INCOME, 500, C.INTERNAL_TRANSFER), tx('eur', EXPENSE, 500, C.INTERNAL_TRANSFER)];

    expect(dailyNet(txs, OPTIONS)).toBe(0);
  });

  test('it ignores transfers', () => {
    expect(dailyNet([tx('usd', TRANSFER, 900), tx('usd', EXPENSE, 5)], OPTIONS)).toBeCloseTo(-5);
  });

  test('a transaction whose account is gone cannot invent a currency', () => {
    expect(dailyNet([tx('ghost', INCOME, 100)], OPTIONS)).toBe(100);
  });

  test('an empty day is zero', () => {
    expect(dailyNet([], OPTIONS)).toBe(0);
  });
});
