import { importBackup } from '../importBackup';
import { createTestStore } from '../../../test/createTestStore';

jest.mock('../../../services', () => ({
  ratesOrSeed: jest.requireActual('../../../services/RatesService').ratesOrSeed,
}));

const backup = (baseCurrency, settings = {}) => ({
  accounts: [{ hash: 'a1', currency: baseCurrency }],
  scheduledTxs: [],
  settings: { baseCurrency, ...settings },
  txs: [{ hash: 't1', account: 'a1', value: 10 }],
});

const createState = async (settings = {}) => {
  const store = await createTestStore({ rates: { '2026-01': { USD: 2 } }, settings });

  return {
    store,
    state: { rates: { '2026-01': { USD: 2 } }, settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR', ...settings }, store },
  };
};

describe('contexts/reducers/importBackup', () => {
  // Leaving the cache empty made every foreign balance read 0.00 until a fetch landed, which offline never does.
  test('a backup in another base currency lands on the bundled series, never on nothing', async () => {
    const { state, store } = await createState();
    const setState = jest.fn();

    await importBackup(backup('JPY'), [state, setState]);

    const written = store.get('rates').value;
    const [month] = Object.keys(written);

    expect(Object.keys(written).length).toBeGreaterThan(12);
    expect(written[month].JPY).toBe(1);
    expect(written[month].USD).toBeGreaterThan(0);
    expect(store.get('settings').value.ratesBaseCurrency).toBeUndefined();
    expect(setState.mock.calls[0][0]({ rates: state.rates }).rates).toEqual(written);
  });

  test('a cache that is empty rather than absent is still no cache at all', async () => {
    const store = await createTestStore({ rates: {}, settings: {} });
    const state = { rates: {}, settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' }, store };
    const setState = jest.fn();

    await importBackup(backup('EUR'), [state, setState]);

    expect(Object.keys(store.get('rates').value).length).toBeGreaterThan(12);
  });

  test('keeps the cached rates when the base currency matches and they were downloaded after the build', async () => {
    const { state, store } = await createState();
    state.settings.lastRatesUpdate = '2099-01-01T00:00:00.000Z';
    const setState = jest.fn();

    await importBackup(backup('EUR'), [state, setState]);

    expect(store.get('rates').value).toEqual({ '2026-01': { USD: 2 } });
    expect(store.get('settings').value.ratesBaseCurrency).toBe('EUR');
  });

  // The backup carries the exporting device's timestamp but never its rates, so it cannot vouch for the seed.
  test('substituting the seed clears the timestamp instead of letting the backup date it', async () => {
    const { state, store } = await createState();
    const setState = jest.fn();

    await importBackup(backup('JPY', { lastRatesUpdate: '2026-08-23T06:01:04.123Z' }), [state, setState]);

    expect(store.get('settings').value.lastRatesUpdate).toBeUndefined();
    expect(Object.keys(store.get('rates').value).length).toBeGreaterThan(12);
  });

  test('replaces the ledger with the one in the file', async () => {
    const { state, store } = await createState();

    await importBackup(backup('EUR'), [state, jest.fn()]);

    expect(store.get('txs').value).toEqual([{ hash: 't1', account: 'a1', value: 10 }]);
    expect(store.get('accounts').value).toHaveLength(1);
  });

  test('keeps the lock of this device, whatever the backup carries', async () => {
    const { state, store } = await createState({ pin: '1234' });

    await importBackup({ ...backup('EUR'), settings: { baseCurrency: 'EUR', pin: '9999' } }, [state, jest.fn()]);

    expect(store.get('settings').value.pin).toBe('1234');
  });

  test('leaves the device unlocked when it had no pin', async () => {
    const { state, store } = await createState();

    await importBackup({ ...backup('EUR'), settings: { baseCurrency: 'EUR', pin: '9999' } }, [state, jest.fn()]);

    expect(store.get('settings').value.pin).toBeUndefined();
  });
});
