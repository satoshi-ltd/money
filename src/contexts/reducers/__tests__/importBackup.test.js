import { importBackup } from '../importBackup';

jest.mock('../../../services', () => ({
  NotificationsService: { notifyPremiumUnlocked: jest.fn(() => Promise.resolve()) },
}));

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
      data[next] = Array.isArray(data[next]) ? [] : {};
      return Promise.resolve();
    },
  };

  return store;
};

const backup = (baseCurrency) => ({
  accounts: [{ hash: 'a1', currency: baseCurrency }],
  scheduledTxs: [],
  settings: { baseCurrency },
  txs: [],
});

describe('contexts/reducers/importBackup', () => {
  const createState = () => {
    const data = {
      accounts: [],
      rates: { '2026-01': { USD: 2 } },
      scheduledTxs: [],
      settings: {},
      subscription: {},
      txs: [],
    };

    return [data, { rates: data.rates, settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' }, store: createStore(data) }];
  };

  test('drops the cached rates when the backup uses another base currency', async () => {
    const [data, state] = createState();
    const setState = jest.fn();

    await importBackup(backup('JPY'), [state, setState]);

    expect(data.rates).toEqual({});
    expect(data.settings.ratesBaseCurrency).toBeUndefined();
    expect(setState.mock.calls[0][0]({ rates: state.rates }).rates).toEqual({});
  });

  test('keeps the lock of this device, whatever the backup carries', async () => {
    const [data, state] = createState();
    state.settings.pin = '1234';
    const setState = jest.fn();

    await importBackup({ ...backup('EUR'), settings: { baseCurrency: 'EUR', pin: '9999' } }, [state, setState]);

    expect(data.settings.pin).toBe('1234');
  });

  test('leaves the device unlocked when it had no pin', async () => {
    const [data, state] = createState();
    const setState = jest.fn();

    await importBackup({ ...backup('EUR'), settings: { baseCurrency: 'EUR', pin: '9999' } }, [state, setState]);

    expect(data.settings.pin).toBeUndefined();
  });

  test('keeps the cached rates when the base currency matches', async () => {
    const [data, state] = createState();
    const setState = jest.fn();

    await importBackup(backup('EUR'), [state, setState]);

    expect(data.rates).toEqual({ '2026-01': { USD: 2 } });
    expect(data.settings.ratesBaseCurrency).toBe('EUR');
    expect(setState.mock.calls[0][0]({ rates: state.rates }).rates).toEqual({ '2026-01': { USD: 2 } });
  });
});
