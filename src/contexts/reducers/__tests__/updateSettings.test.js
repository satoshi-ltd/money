import { updateRates } from '../updateRates';
import { updateSettings } from '../updateSettings';
import { DEFAULTS } from '../../store.constants';

const createStore = (data) => {
  let key;

  const store = {
    get(next) {
      key = next;
      return store;
    },
    get value() {
      return data[key];
    },
    save(value) {
      data[key] = Array.isArray(data[key]) ? [...data[key], ...value] : { ...data[key], ...value };
      return Promise.resolve(value);
    },
    wipe(next) {
      data[next] = {};
      return Promise.resolve();
    },
  };

  return store;
};

describe('contexts/reducers settings writes', () => {
  test('never lets a stale snapshot erase a setting written meanwhile', async () => {
    const data = { accounts: [], rates: {}, settings: { ...DEFAULTS.settings } };
    const store = createStore(data);
    const snapshot = { rates: {}, settings: { ...DEFAULTS.settings }, store };
    const setState = jest.fn();

    await updateSettings({ pin: '1234' }, [snapshot, setState]);
    expect(data.settings.pin).toBe('1234');

    await updateRates({ currency: 'EUR', '2026-01': { USD: 2 } }, [snapshot, setState]);

    expect(data.settings.pin).toBe('1234');
    expect(setState.mock.calls[1][0]({ settings: {} }).settings.pin).toBe('1234');
  });

  test('merges a change onto what is stored, not onto the caller snapshot', async () => {
    const data = { settings: { baseCurrency: 'EUR', theme: 'dark' } };
    const store = createStore(data);
    const setState = jest.fn();

    await updateSettings({ theme: 'light' }, [{ settings: { baseCurrency: 'JPY' }, store }, setState]);

    expect(data.settings).toEqual({ baseCurrency: 'EUR', theme: 'light' });
  });

  test('updates state without dropping the slices it did not touch', async () => {
    const data = { settings: { theme: 'dark' } };
    const setState = jest.fn();

    await updateSettings({ theme: 'light' }, [{ settings: {}, store: createStore(data) }, setState]);

    const next = setState.mock.calls[0][0]({ accounts: [{ hash: 'a1' }], txs: [{ hash: 't1' }], settings: {} });

    expect(next.accounts).toHaveLength(1);
    expect(next.txs).toHaveLength(1);
    expect(next.settings.theme).toBe('light');
  });
});
