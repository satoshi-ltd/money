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
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 3, __length: 1200 });
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
    expect(written).toEqual(['money:txs:2', 'money:txs']);
  });

  test('removes the chunks that are no longer needed when the ledger shrinks', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });

    await instance.write({ ...DEFAULTS, txs: txs(200) }, 'txs');

    expect(store['money:txs:1']).toBeUndefined();
    expect(store['money:txs:2']).toBeUndefined();
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 1, __length: 200 });
    expect((await instance.read()).txs).toHaveLength(200);
  });

  test('keeps every chunk under what Android will hand back', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(7048) });

    const biggest = Math.max(...Object.values(store).map((value) => value.length));

    expect(biggest).toBeLessThan(2 * 1024 * 1024);
  });

  test('refuses to load a ledger whose chunk did not come back', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });
    delete store['money:txs:1'];

    await expect((await adapter()).read()).rejects.toThrow('money:txs:1 is missing');
  });

  test('refuses to load a ledger that comes back short', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });
    store['money:txs:1'] = JSON.stringify([{ hash: 'only-one' }]);

    await expect((await adapter()).read()).rejects.toThrow('expected 1200 entries');
  });

  // The count is an echo of the rows: refusing to open on a stale echo loses the ledger over a number.
  test('a ledger whose rows outran its count opens, and the count is repaired', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });
    store['money:txs:2'] = JSON.stringify(txs(300, 'x'));

    const data = await (await adapter()).read();

    expect(data.txs).toHaveLength(1300);
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 3, __length: 1300 });
  });

  // Unqueued, the slower write commits its index after the faster one and leaves a count the rows contradict.
  test('two writes of one collection never leave a count the rows contradict', async () => {
    const instance = await adapter();
    let batches = 0;
    AsyncStorage.multiSet.mockImplementation((entries) => {
      const delay = batches++ === 0 ? 30 : 0;
      return new Promise((resolve) =>
        setTimeout(() => {
          entries.forEach(([key, value]) => (store[key] = value));
          resolve();
        }, delay),
      );
    });

    const data = { ...DEFAULTS, txs: txs(1200) };
    const first = instance.write(data, 'txs');
    data.txs = txs(1300);
    await Promise.all([first, instance.write(data, 'txs')]);

    // Straight off the disk: reading it back would repair the very mismatch this is looking for.
    const rows = [0, 1, 2].reduce((total, index) => total + JSON.parse(store[`money:txs:${index}`]).length, 0);

    expect(rows).toBe(1300);
    expect(JSON.parse(store['money:txs'])).toEqual({ __chunks: 3, __length: rows });
  });

  test('keeps the index honest while the ledger shrinks', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });

    const order = [];
    AsyncStorage.multiSet.mockImplementation((entries) => {
      order.push(`set:${entries.map(([key]) => key).join(',')}`);
      entries.forEach(([key, value]) => (store[key] = value));
      return Promise.resolve();
    });
    AsyncStorage.multiRemove.mockImplementation((keys) => {
      order.push(`remove:${keys.join(',')}`);
      keys.forEach((key) => delete store[key]);
      return Promise.resolve();
    });

    await instance.write({ ...DEFAULTS, txs: txs(200) }, 'txs');

    expect(order).toEqual(['set:money:txs:0,money:txs', 'remove:money:txs:1,money:txs:2']);
  });

  describe('a process killed between two writes', () => {
    const crashAfter = (calls) => {
      let seen = 0;
      const gate = (apply) =>
        (...args) => {
          seen += 1;
          return seen > calls ? Promise.reject(new Error('killed')) : apply(...args);
        };
      const { getItem, multiGet } = AsyncStorage;
      const setItem = AsyncStorage.setItem.getMockImplementation();
      const multiSet = AsyncStorage.multiSet.getMockImplementation();
      const multiRemove = AsyncStorage.multiRemove.getMockImplementation();
      AsyncStorage.setItem.mockImplementation(gate(setItem));
      AsyncStorage.multiSet.mockImplementation(gate(multiSet));
      AsyncStorage.multiRemove.mockImplementation(gate(multiRemove));
      return { getItem, multiGet };
    };

    const reopen = async () => {
      jest.clearAllMocks();
      AsyncStorage.getItem.mockImplementation((key) => Promise.resolve(store[key] ?? null));
      AsyncStorage.multiGet.mockImplementation((keys) => Promise.resolve(keys.map((key) => [key, store[key] ?? null])));
      AsyncStorage.setItem.mockImplementation((key, value) => Promise.resolve((store[key] = value)));
      return (await adapter()).read();
    };

    test.each([0, 1, 2])('deleting one of 1,200 entries and dying after %i writes still opens', async (calls) => {
      const instance = await adapter();
      await instance.write({ ...DEFAULTS, txs: txs(1200) });

      crashAfter(calls);
      await instance.write({ ...DEFAULTS, txs: txs(1199) }, 'txs').catch(() => undefined);

      const { txs: rows } = await reopen();
      expect([1199, 1200]).toContain(rows.length);
    });

    test.each([0, 1, 2])('shrinking to one chunk and dying after %i writes still opens', async (calls) => {
      const instance = await adapter();
      await instance.write({ ...DEFAULTS, txs: txs(1200) });

      crashAfter(calls);
      await instance.write({ ...DEFAULTS, txs: txs(200) }, 'txs').catch(() => undefined);

      const { txs: rows } = await reopen();
      expect([200, 1200]).toContain(rows.length);
    });

    test.each([0, 1, 2])('adding an entry and dying after %i writes still opens', async (calls) => {
      const instance = await adapter();
      await instance.write({ ...DEFAULTS, txs: txs(1200) });

      crashAfter(calls);
      await instance.write({ ...DEFAULTS, txs: txs(1201) }, 'txs').catch(() => undefined);

      const { txs: rows } = await reopen();
      expect([1200, 1201]).toContain(rows.length);
    });
  });

  test('says what it could not read instead of a bare message', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(600) });
    delete store['money:txs:1'];

    await expect((await adapter()).read()).rejects.toThrow(/money could not be loaded correctly: /);
  });

  test('surfaces a write failure instead of swallowing it', async () => {
    const instance = await adapter();
    AsyncStorage.setItem.mockRejectedValue(new Error('disk full'));

    await expect(instance.write(DEFAULTS, 'settings')).rejects.toThrow('money could not be saved correctly.');
  });

  test('surfaces an unreadable database', async () => {
    AsyncStorage.multiGet.mockRejectedValue(new Error('Row too big to fit into CursorWindow'));

    await expect((await adapter()).read()).rejects.toThrow(/money could not be loaded correctly/);
  });

  test('wipe clears the index and every chunk', async () => {
    const instance = await adapter();
    await instance.write({ ...DEFAULTS, txs: txs(1200) });

    await instance.wipe();

    expect(Object.keys(store)).toEqual([]);
  });
});
