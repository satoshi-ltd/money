import { updateTx } from '../updateTx';
import { createTestStore } from '../../../test/createTestStore';
import { DEFAULTS } from '../../store.constants';

const TX = { account: 'a1', category: 2, hash: 't1', timestamp: 1, title: 'Coffee', type: 0, value: 40 };

describe('contexts/reducers/updateTx', () => {
  test('writes the new fields, hands back the updated row and leaves the settings untouched', async () => {
    const store = await createTestStore({ settings: { ...DEFAULTS.settings }, txs: [TX] });
    const setState = jest.fn();
    const before = JSON.stringify(store.get('settings').value);

    const updated = await updateTx({ hash: 't1', title: 'Coffee beans', value: 45 }, [{ settings: DEFAULTS.settings, store }, setState]);

    expect(updated).toMatchObject({ hash: 't1', title: 'Coffee beans', value: 45 });
    expect(store.get('txs').value[0]).toMatchObject({ title: 'Coffee beans', value: 45 });
    expect(JSON.stringify(store.get('settings').value)).toBe(before);
    expect(setState).toHaveBeenCalledTimes(1);
    expect(setState.mock.calls[0][0]({ txs: [] }).txs).toHaveLength(1);
  });

  test('an unknown hash changes nothing and answers undefined', async () => {
    const store = await createTestStore({ settings: { ...DEFAULTS.settings }, txs: [TX] });
    const setState = jest.fn();

    expect(await updateTx({ hash: 'nope', value: 1 }, [{ settings: {}, store }, setState])).toBeUndefined();
    expect(setState).not.toHaveBeenCalled();
    expect(store.get('txs').value[0].value).toBe(40);
  });
});
