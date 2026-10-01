import { migrateState } from '../migrateState';
import { retireSettings } from '../retireSettings';
import { updateSettings } from '../../reducers/updateSettings';
import { createTestStore } from '../../../test/createTestStore';

const STORED = { autoAmount: { rules: { 0: { a1: { coffee: '40' } } }, stats: {} }, baseCurrency: 'EUR', theme: 'dark' };

describe('contexts/modules/retireSettings', () => {
  test('a catalog the app no longer keeps leaves the disk, since a save can only add keys', async () => {
    const store = await createTestStore({ settings: STORED });
    const migrated = migrateState({ accounts: [], settings: store.get('settings').value, txs: [] });

    await store.get('settings').save(migrated.settings);
    expect(store.get('settings').value.autoAmount).toBeDefined();

    await retireSettings({ migrated, stored: STORED, store });

    expect(store.get('settings').value.autoAmount).toBeUndefined();
    expect(store.get('settings').value.baseCurrency).toBe('EUR');
    expect(store.get('settings').value.theme).toBe('dark');
  });

  test('and no later write brings it back into the state or onto the disk', async () => {
    const store = await createTestStore({ settings: STORED });
    const migrated = migrateState({ accounts: [], settings: STORED, txs: [] });
    await retireSettings({ migrated, stored: STORED, store });
    const setState = jest.fn();

    await updateSettings({ theme: 'light' }, [{ settings: migrated.settings, store }, setState]);

    expect(store.get('settings').value.autoAmount).toBeUndefined();
    expect(setState.mock.calls[0][0]({ settings: {} }).settings.autoAmount).toBeUndefined();
  });

  test('a settings object that never held one is left alone: nothing is rewritten', async () => {
    const store = await createTestStore({ settings: { baseCurrency: 'EUR' } });
    const replace = jest.spyOn(store, 'replace');

    await retireSettings({ migrated: { settings: { baseCurrency: 'EUR' } }, stored: { baseCurrency: 'EUR' }, store });

    expect(replace).not.toHaveBeenCalled();
  });
});
