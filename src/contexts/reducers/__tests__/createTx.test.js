import { createTx } from '../createTx';
import { createTestStore } from '../../../test/createTestStore';
import { DEFAULTS } from '../../store.constants';

describe('contexts/reducers/createTx learning', () => {
  test('a new entry teaches the category and account catalogs and writes no amount catalog', async () => {
    const store = await createTestStore({ settings: { ...DEFAULTS.settings } });
    const setState = jest.fn();
    const state = { settings: { ...DEFAULTS.settings }, store };

    await createTx({ account: 'a1', category: 2, timestamp: 1, title: 'Coffee beans', type: 0, value: 40 }, [state, setState]);

    const stored = store.get('settings').value;
    expect(Object.keys(stored.autoCategory.rules).length).toBeGreaterThan(0);
    expect(Object.keys(stored.autoAccount.rules).length).toBeGreaterThan(0);
    expect(stored.autoAmount).toBeUndefined();
  });
});
