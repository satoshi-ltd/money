import { calcAccount } from '../calcAccount';
import { C, isOwed, ledgerPosition } from '../../../modules';
import { sortAccounts } from '../../../modules/sortAccounts';

const { EXPENSE, INCOME } = C.TX.TYPE;

const RATES = { '2026-08': { EUR: 1, BTC: 0.00002 } };
const NOW = new Date('2026-08-26T09:00:00Z');

const settle = (account, txs) =>
  calcAccount({
    account: { hash: 'a1', balance: 0, ...account },
    baseCurrency: 'EUR',
    genesisDate: new Date('2026-08-01T00:00:00Z'),
    now: NOW,
    rates: RATES,
    txs: txs.map((tx, index) => ({ account: 'a1', timestamp: NOW.getTime() - index, ...tx })),
  });

describe('contexts/calcAccount settled balance', () => {
  const RESIDUE = [
    { type: INCOME, value: 0.3 },
    { type: EXPENSE, value: 0.1 },
    { type: EXPENSE, value: 0.2 },
  ];

  test('an account whose entries cancel out is exactly zero, not a float residue', () => {
    const settled = settle({ currency: 'EUR' }, RESIDUE);

    expect(settled.currentBalance).toBe(0);
    expect(settled.currentBalanceBase).toBe(0);
  });

  test('a settled account is not owed, owes nothing and sinks with the other zeros', () => {
    const settled = settle({ currency: 'EUR', title: 'Settled' }, RESIDUE);
    const busy = settle({ currency: 'EUR', title: 'Busy' }, [{ type: INCOME, value: 5 }]);

    expect(isOwed(settled)).toBe(false);
    expect(ledgerPosition([settled])).toEqual({ assets: 0, owed: 0 });
    expect(sortAccounts([settled, busy]).map(({ title }) => title)).toEqual(['Busy', 'Settled']);
  });

  test('a small debt in a currency with many decimals keeps its sign', () => {
    const settled = settle({ currency: 'BTC' }, [{ type: EXPENSE, value: 0.001 }]);

    expect(settled.currentBalance).toBe(-0.001);
    expect(isOwed(settled)).toBe(true);
  });

  test('a real balance is untouched', () => {
    expect(settle({ balance: 100.25, currency: 'EUR' }, [{ type: EXPENSE, value: 0.25 }]).currentBalance).toBe(100);
  });
});
