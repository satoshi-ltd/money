import { createTx } from '../createTx';
import { createTestStore } from '../../../test/createTestStore';
import { DEFAULTS } from '../../store.constants';

describe('contexts/reducers/createTx', () => {
  test('a new entry writes the transaction and no learning catalog into the settings', async () => {
    const store = await createTestStore({ settings: { ...DEFAULTS.settings } });
    const setState = jest.fn();
    const state = { settings: { ...DEFAULTS.settings }, store };

    await createTx({ account: 'a1', category: 2, timestamp: 1, title: 'Coffee beans', type: 0, value: 40 }, [state, setState]);

    const stored = store.get('settings').value;
    expect(store.get('txs').value).toHaveLength(1);
    expect(['autoAccount', 'autoAmount', 'autoCategory'].filter((key) => key in stored)).toEqual([]);
  });
});
