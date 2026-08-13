import { deleteAccount } from '../deleteAccount';
import { createTestStore } from '../../../test/createTestStore';
import { NotificationsService } from '../../../services';

jest.mock('../../../services', () => ({
  NotificationsService: { syncScheduled: jest.fn(() => Promise.resolve()) },
}));

const seed = {
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

describe('contexts/reducers/deleteAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  test('removes the account together with its transactions and scheduled templates', async () => {
    const store = await createTestStore(seed);
    const setState = jest.fn();

    await deleteAccount({ hash: 'a1' }, [{ store }, setState]);

    expect(store.get('accounts').value).toEqual([{ hash: 'a2' }]);
    expect(store.get('txs').value).toEqual([{ hash: 't2', account: 'a2' }]);
    expect(store.get('scheduledTxs').value).toEqual([{ id: 's2', account: 'a2' }]);

    expect(setState.mock.calls[0][0]({})).toMatchObject({ scheduledTxs: [{ id: 's2', account: 'a2' }] });
    expect(NotificationsService.syncScheduled).toHaveBeenCalledWith({
      scheduledTxs: [{ id: 's2', account: 'a2' }],
      txs: [{ hash: 't2', account: 'a2' }],
    });
  });

  test('does nothing when the account is unknown', async () => {
    const store = await createTestStore(seed);
    const setState = jest.fn();

    await deleteAccount({ hash: 'nope' }, [{ store }, setState]);

    expect(store.get('accounts').value).toHaveLength(2);
    expect(store.get('scheduledTxs').value).toHaveLength(2);
    expect(setState).not.toHaveBeenCalled();
  });
});
