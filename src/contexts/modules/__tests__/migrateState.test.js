import { migrateState } from '../migrateState';
import { RATES_SCHEMA } from '../../store.constants';

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

  // The old backend priced gold and silver per gram, so a cache it wrote reads XAU at a thirty-first of its worth.
  test('a rates cache from before the metals moved to ounces is dropped', () => {
    const rates = { '2026-08': { USD: 1, XAU: 0.00674 } };

    expect(migrateState({ rates, settings: { schemaVersion: RATES_SCHEMA - 1 }, txs: [] }).rates).toBeUndefined();
  });

  // Settings merged over DEFAULTS carry the current version whatever the device stored, which would keep it for ever.
  test('a cache from a device that never stored a schema version is dropped too', () => {
    const rates = { '2026-08': { USD: 1, XAU: 0.00674 } };

    expect(migrateState({ rates, settings: {}, txs: [] }).rates).toBeUndefined();
  });

  test('a cache this build wrote itself is left alone', () => {
    const rates = { '2026-08': { USD: 1, XAU: 0.0002169 } };

    expect(migrateState({ rates, settings: { schemaVersion: RATES_SCHEMA }, txs: [] }).rates).toBe(rates);
  });

  test('still normalises the rest of the state', () => {
    const state = migrateState({ accounts: undefined, scheduledTxs: undefined, settings: {}, txs: undefined });

    expect(state.accounts).toEqual([]);
    expect(state.scheduledTxs).toEqual([]);
    expect(state.txs).toEqual([]);
  });
});
