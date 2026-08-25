import { updateRates } from '../updateRates';
import { createTestStore } from '../../../test/createTestStore';

describe('contexts/reducers/updateRates', () => {
  test('merges new months while the base currency holds', async () => {
    const seed = { accounts: [], rates: { '2026-01': { USD: 2 } } };
    const store = await createTestStore(seed);
    const state = {
      rates: seed.rates,
      settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' },
      store,
    };
    const setState = jest.fn();

    await updateRates({ currency: 'EUR', '2026-02': { USD: 4 } }, [state, setState]);

    expect(store.get('rates').value).toEqual({ '2026-01': { USD: 2 }, '2026-02': { USD: 4 } });
    expect(setState.mock.calls[0][0]({}).settings.ratesBaseCurrency).toBe('EUR');
  });

  test('drops rates belonging to the previous base currency', async () => {
    const seed = { accounts: [], rates: { '2026-01': { USD: 2 }, '2025-12': { USD: 3 } } };
    const store = await createTestStore(seed);
    const state = {
      rates: seed.rates,
      settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' },
      store,
    };
    const setState = jest.fn();

    await updateRates({ currency: 'JPY', '2026-01': { USD: 0.006 } }, [state, setState]);

    expect(store.get('rates').value).toEqual({ '2026-01': { USD: 0.006 } });
    expect(setState.mock.calls[0][0]({}).settings).toMatchObject({ baseCurrency: 'JPY', ratesBaseCurrency: 'JPY' });
  });

  test('ignores a response that carries no rates instead of wiping the cache', async () => {
    const seed = { accounts: [], rates: { '2026-01': { USD: 2 } }, settings: { baseCurrency: 'EUR' } };
    const store = await createTestStore(seed);
    const state = {
      rates: seed.rates,
      settings: { baseCurrency: 'EUR', ratesBaseCurrency: 'EUR' },
      store,
    };
    const setState = jest.fn();

    await updateRates({ currency: 'JPY' }, [state, setState]);

    expect(store.get('rates').value).toEqual({ '2026-01': { USD: 2 } });
    expect(store.get('settings').value.baseCurrency).toBe('EUR');
    expect(setState).not.toHaveBeenCalled();
  });

  test('a real download is what Settings reads back as the last update', async () => {
    const seed = { accounts: [], rates: {} };
    const store = await createTestStore(seed);
    const state = { rates: {}, settings: { baseCurrency: 'EUR' }, store };

    await updateRates({ currency: 'EUR', '2026-02': { USD: 4 } }, [state, jest.fn()]);

    expect(store.get('settings').value.lastRatesUpdate).toBeDefined();
  });

  // Converting the cache to a new base is arithmetic, not a download: claiming otherwise dates a stale series.
  test('a local rebase leaves the last update alone', async () => {
    const seed = { accounts: [], rates: { '2026-01': { EUR: 1, USD: 2 } }, settings: { baseCurrency: 'EUR' } };
    const store = await createTestStore(seed);
    const state = { rates: seed.rates, settings: { baseCurrency: 'USD', ratesBaseCurrency: 'EUR' }, store };

    await updateRates({ currency: 'USD', '2026-01': { EUR: 0.5, USD: 1 } }, [state, jest.fn()], { downloaded: false });

    expect(store.get('rates').value).toEqual({ '2026-01': { EUR: 0.5, USD: 1 } });
    expect(store.get('settings').value.lastRatesUpdate).toBeUndefined();
  });

  test('treats an untagged cache as belonging to the current base currency', async () => {
    const seed = { accounts: [], rates: { '2026-01': { USD: 2 } } };
    const store = await createTestStore(seed);
    const state = { rates: store.get('rates').value, settings: { baseCurrency: 'EUR' }, store };
    const setState = jest.fn();

    await updateRates({ '2026-02': { USD: 4 } }, [state, setState]);

    expect(store.get('rates').value).toEqual({ '2026-01': { USD: 2 }, '2026-02': { USD: 4 } });
    expect(setState.mock.calls[0][0]({}).settings.ratesBaseCurrency).toBe('EUR');
  });
});
