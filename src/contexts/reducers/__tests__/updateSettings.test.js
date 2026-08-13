import { updateRates } from '../updateRates';
import { updateSettings } from '../updateSettings';
import { createTestStore } from '../../../test/createTestStore';
import { DEFAULTS } from '../../store.constants';

describe('contexts/reducers settings writes', () => {
  test('never lets a stale snapshot erase a setting written meanwhile', async () => {
    const store = await createTestStore({ settings: { ...DEFAULTS.settings } });
    const snapshot = { rates: {}, settings: { ...DEFAULTS.settings }, store };
    const setState = jest.fn();

    await updateSettings({ pin: '1234' }, [snapshot, setState]);
    expect(store.get('settings').value.pin).toBe('1234');

    await updateRates({ currency: 'EUR', '2026-01': { USD: 2 } }, [snapshot, setState]);

    expect(store.get('settings').value.pin).toBe('1234');
    expect(setState.mock.calls[1][0]({ settings: {} }).settings.pin).toBe('1234');
  });

  test('merges a change onto what is stored, not onto the caller snapshot', async () => {
    const store = await createTestStore({ settings: { baseCurrency: 'EUR', theme: 'dark' } });
    const setState = jest.fn();

    await updateSettings({ theme: 'light' }, [{ settings: { baseCurrency: 'JPY' }, store }, setState]);

    expect(store.get('settings').value).toEqual({ baseCurrency: 'EUR', theme: 'light' });
  });

  test('updates state without dropping the slices it did not touch', async () => {
    const store = await createTestStore({ settings: { theme: 'dark' } });
    const setState = jest.fn();

    await updateSettings({ theme: 'light' }, [{ settings: {}, store }, setState]);

    const next = setState.mock.calls[0][0]({ accounts: [{ hash: 'a1' }], txs: [{ hash: 't1' }], settings: {} });

    expect(next.accounts).toHaveLength(1);
    expect(next.txs).toHaveLength(1);
    expect(next.settings.theme).toBe('light');
  });
});
