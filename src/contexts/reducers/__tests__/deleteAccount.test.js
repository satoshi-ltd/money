import { deleteAccount } from '../deleteAccount';
import { NotificationsService } from '../../../services';

jest.mock('../../../services', () => ({
  NotificationsService: { syncScheduled: jest.fn(() => Promise.resolve()) },
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
    findOne(query) {
      return data[key].find((row) => Object.keys(query).every((field) => row[field] === query[field]));
    },
    remove(query) {
      const removed = data[key].filter((row) => Object.keys(query).every((field) => row[field] === query[field]));
      data[key] = data[key].filter((row) => !removed.includes(row));
      return removed;
    },
  };

  return store;
};

describe('contexts/reducers/deleteAccount', () => {
  test('removes the account together with its transactions and scheduled templates', async () => {
    const data = {
      accounts: [{ hash: 'a1' }, { hash: 'a2' }],
      scheduledTxs: [
        { id: 's1', account: 'a1' },
        { id: 's2', account: 'a2' },
      ],
      txs: [
        { hash: 't1', account: 'a1' },
        { hash: 't2', account: 'a2' },
      ],
    };
    const state = { store: createStore(data) };
    const setState = jest.fn();

    await deleteAccount({ hash: 'a1' }, [state, setState]);

    expect(data.accounts).toEqual([{ hash: 'a2' }]);
    expect(data.txs).toEqual([{ hash: 't2', account: 'a2' }]);
    expect(data.scheduledTxs).toEqual([{ id: 's2', account: 'a2' }]);

    expect(setState).toHaveBeenCalledWith(
      expect.objectContaining({ scheduledTxs: [{ id: 's2', account: 'a2' }] }),
    );
    expect(NotificationsService.syncScheduled).toHaveBeenCalledWith({
      scheduledTxs: [{ id: 's2', account: 'a2' }],
      txs: [{ hash: 't2', account: 'a2' }],
    });
  });

  test('does nothing when the account is unknown', async () => {
    const data = { accounts: [{ hash: 'a1' }], scheduledTxs: [{ id: 's1', account: 'a1' }], txs: [] };
    const setState = jest.fn();

    await deleteAccount({ hash: 'nope' }, [{ store: createStore(data) }, setState]);

    expect(data.accounts).toHaveLength(1);
    expect(data.scheduledTxs).toHaveLength(1);
    expect(setState).not.toHaveBeenCalled();
  });
});
