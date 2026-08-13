import { migrateState } from '../migrateState';

const storedAccount = {
  hash: 'a1',
  balance: 269530,
  currency: 'THB',
  timestamp: 1706009148394,
  title: 'Kasikorn',
};

const consolidatedAccount = {
  ...storedAccount,
  chartBalance: new Array(32).fill(1),
  chartBalanceBase: new Array(32).fill(1),
  currentBalance: 78896.9,
  currentBalanceBase: 2386.36,
  currentMonth: { expenses: 1, incomes: 2 },
  txs: new Array(4909).fill({ hash: 't', account: 'a1', value: 1 }),
};

describe('contexts/modules/migrateState', () => {
  test('keeps only what an account really is', () => {
    const { accounts } = migrateState({ accounts: [consolidatedAccount], settings: {}, txs: [] });

    expect(accounts[0]).toEqual(storedAccount);
    expect(accounts[0].txs).toBeUndefined();
    expect(accounts[0].chartBalance).toBeUndefined();
  });

  test('strips the derived payload that made the row grow', () => {
    const before = JSON.stringify([consolidatedAccount]).length;
    const { accounts } = migrateState({ accounts: [consolidatedAccount], settings: {}, txs: [] });

    expect(JSON.stringify(accounts).length).toBeLessThan(before / 100);
  });

  test('leaves a clean account untouched', () => {
    const { accounts } = migrateState({ accounts: [storedAccount], settings: {}, txs: [] });

    expect(accounts).toEqual([storedAccount]);
  });

  test('still normalises the rest of the state', () => {
    const state = migrateState({ accounts: undefined, scheduledTxs: undefined, settings: {}, txs: undefined });

    expect(state.accounts).toEqual([]);
    expect(state.scheduledTxs).toEqual([]);
    expect(state.txs).toEqual([]);
  });
});
