import { updateRates } from '../updateRates';

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

describe('contexts/reducers/updateRates', () => {
  test('merges new months while the base currency holds', async () => {
    const data = { accounts: [], rates: { '2026-01': { USD: 2 } } };
    const state = {
      rates: data.rates,
      settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' },
      store: createStore(data),
    };
    const setState = jest.fn();

    await updateRates({ currency: 'EUR', '2026-02': { USD: 4 } }, [state, setState]);

    expect(data.rates).toEqual({ '2026-01': { USD: 2 }, '2026-02': { USD: 4 } });
    expect(setState.mock.calls[0][0].settings.ratesBaseCurrency).toBe('EUR');
  });

  test('drops rates belonging to the previous base currency', async () => {
    const data = { accounts: [], rates: { '2026-01': { USD: 2 }, '2025-12': { USD: 3 } } };
    const state = {
      rates: data.rates,
      settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' },
      store: createStore(data),
    };
    const setState = jest.fn();

    await updateRates({ currency: 'JPY', '2026-01': { USD: 0.006 } }, [state, setState]);

    expect(data.rates).toEqual({ '2026-01': { USD: 0.006 } });
    expect(setState.mock.calls[0][0].settings).toMatchObject({ baseCurrency: 'JPY', ratesBaseCurrency: 'JPY' });
  });

  test('treats an untagged cache as belonging to the current base currency', async () => {
    const data = { accounts: [], rates: { '2026-01': { USD: 2 } } };
    const state = { rates: data.rates, settings: { baseCurrency: 'EUR' }, store: createStore(data) };
    const setState = jest.fn();

    await updateRates({ '2026-02': { USD: 4 } }, [state, setState]);

    expect(data.rates).toEqual({ '2026-01': { USD: 2 }, '2026-02': { USD: 4 } });
    expect(setState.mock.calls[0][0].settings.ratesBaseCurrency).toBe('EUR');
  });
});
