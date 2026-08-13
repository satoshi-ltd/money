import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageAdapter } from '../asyncStorage';

const store = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  removeItem: jest.fn(),
}));

const DEFAULTS = { accounts: [], rates: {}, settings: {}, txs: [] };
const txs = (count, prefix = 't') => Array.from({ length: count }, (item, index) => ({ hash: `${prefix}${index}` }));

const adapter = () => new AsyncStorageAdapter({ defaults: DEFAULTS, filename: 'money' });

beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
  jest.clearAllMocks();

  AsyncStorage.getItem.mockImplementation((key) => Promise.resolve(store[key] ?? null));
  AsyncStorage.setItem.mockImplementation((key, value) => {
    store[key] = value;
    return Promise.resolve();
  });
  AsyncStorage.multiGet.mockImplementation((keys) => Promise.resolve(keys.map((key) => [key, store[key] ?? null])));
  AsyncStorage.multiSet.mockImplementation((entries) => {
    entries.forEach(([key, value]) => (store[key] = value));
    return Promise.resolve();
  });
  AsyncStorage.multiRemove.mockImplementation((keys) => {
    keys.forEach((key) => delete store[key]);
    return Promise.resolve();
  });
  AsyncStorage.removeItem.mockImplementation((key) => {
    delete store[key];
    return Promise.resolve();
  });
});

describe('services/modules/asyncStorage', () => {
  test('splits a legacy single-key database and drops the old key', async () => {
    store.money = JSON.stringify({ accounts: [{ hash: 'a1' }], txs: txs(1200), settings: { theme: 'dark' }, rates: {} });

    const instance = await adapter();

    expect(store.money).toBeUndefined();
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 3 });
    expect((await instance.read()).txs).toHaveLength(1200);
  });

  test('reads every collection back through a fresh instance', async () => {
    store.money = JSON.stringify({ accounts: [{ hash: 'a1' }], txs: txs(3), settings: { theme: 'dark' }, rates: {} });
    await adapter();

    const data = await (await adapter()).read();

    expect(data.accounts).toEqual([{ hash: 'a1' }]);
    expect(data.settings).toEqual({ theme: 'dark' });
    expect(data.txs).toHaveLength(3);
    expect(data.rates).toEqual({});
  });

  test('falls back to the defaults for a collection never written', async () => {
    expect(await (await adapter()).read()).toEqual(DEFAULTS);
  });

  test('adding one transaction rewrites a single chunk, not the ledger', async () => {
    const instance = await adapter();
    const ledger = txs(1200);
    await instance.write({ ...DEFAULTS, txs: ledger });
    jest.clearAllMocks();

    await instance.write({ ...DEFAULTS, txs: [...ledger, { hash: 'new' }] }, 'txs');

    const written = AsyncStorage.multiSet.mock.calls.flatMap(([entries]) => entries.map(([key]) => key));
    expect(written).toEqual(['money:txs:2']);
  });

  test('removes the chunks that are no longer needed when the ledger shrinks', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });

    await instance.write({ ...DEFAULTS, txs: txs(200) }, 'txs');

    expect(store['money:txs:1']).toBeUndefined();
    expect(store['money:txs:2']).toBeUndefined();
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 1 });
    expect((await instance.read()).txs).toHaveLength(200);
  });

  test('keeps every chunk under what Android will hand back', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(7048) });

    const biggest = Math.max(...Object.values(store).map((value) => value.length));

    expect(biggest).toBeLessThan(2 * 1024 * 1024);
  });

  test('surfaces a write failure instead of swallowing it', async () => {
    const instance = await adapter();
    AsyncStorage.setItem.mockRejectedValue(new Error('disk full'));

    await expect(instance.write(DEFAULTS, 'settings')).rejects.toThrow('money could not be saved correctly.');
  });

  test('surfaces an unreadable database', async () => {
    AsyncStorage.multiGet.mockRejectedValue(new Error('Row too big to fit into CursorWindow'));

    await expect((await adapter()).read()).rejects.toThrow('money could not be loaded correctly.');
  });

  test('wipe clears the index and every chunk', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });

    await instance.wipe();

    expect(Object.keys(store)).toEqual([]);
  });
});
