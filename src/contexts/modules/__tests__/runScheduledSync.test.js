import { runScheduledSync } from '../runScheduledSync';
import { C } from '../../../modules';
import { NotificationsService } from '../../../services';

jest.mock('../../../services', () => ({
  NotificationsService: { syncScheduled: jest.fn(() => Promise.resolve()) },
}));

const { EXPENSE } = C.TX.TYPE;
const DAY = C.MS_IN_DAY;

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
      data[key] = Array.isArray(data[key])
        ? [...data[key], ...(Array.isArray(value) ? value : [value])]
        : { ...data[key], ...value };
      return Promise.resolve(value);
    },
  };

  return store;
};

const scheduled = (id, account) => ({
  id,
  account,
  category: 1,
  title: 'Rent',
  type: EXPENSE,
  value: 100,
  startAt: Date.now() - 40 * DAY,
  pattern: { kind: 'monthly', interval: 1 },
});

describe('contexts/modules/runScheduledSync', () => {
  beforeEach(() => {
    NotificationsService.syncScheduled.mockClear();
  });

  test('materialises the occurrences of templates whose account still exists', async () => {
    const data = { settings: {}, txs: [] };
    const migrated = {
      accounts: [{ hash: 'a1' }],
      scheduledTxs: [scheduled('s1', 'a1')],
      settings: {},
      txs: [],
    };

    const next = await runScheduledSync({ migrated, store: createStore(data) });

    expect(next.txs.length).toBeGreaterThan(0);
    expect(next.txs.every(({ meta }) => meta.scheduledId === 's1')).toBe(true);
    expect(NotificationsService.syncScheduled.mock.calls[0][0].scheduledTxs).toHaveLength(1);
  });

  test('ignores templates whose account was deleted', async () => {
    const data = { settings: {}, txs: [] };
    const migrated = {
      accounts: [{ hash: 'a1' }],
      scheduledTxs: [scheduled('s1', 'a1'), scheduled('s2', 'gone')],
      settings: {},
      txs: [],
    };

    const next = await runScheduledSync({ migrated, store: createStore(data) });

    expect(next.txs.some(({ meta }) => meta.scheduledId === 's2')).toBe(false);
    expect(NotificationsService.syncScheduled.mock.calls[0][0].scheduledTxs).toHaveLength(1);
  });

  test('keeps working when the caller does not know the accounts', async () => {
    const data = { settings: {}, txs: [] };
    const migrated = { scheduledTxs: [scheduled('s1', 'a1')], settings: {}, txs: [] };

    const next = await runScheduledSync({ migrated, store: createStore(data) });

    expect(next.txs.length).toBeGreaterThan(0);
    expect(NotificationsService.syncScheduled.mock.calls[0][0].scheduledTxs).toHaveLength(1);
  });

  test('does not create a transaction that already exists for the same occurrence', async () => {
    const data = { settings: {}, txs: [] };
    const template = scheduled('s1', 'a1');
    const first = await runScheduledSync({
      migrated: { accounts: [{ hash: 'a1' }], scheduledTxs: [template], settings: {}, txs: [] },
      store: createStore(data),
    });

    const second = await runScheduledSync({
      migrated: { accounts: [{ hash: 'a1' }], scheduledTxs: [template], settings: {}, txs: first.txs },
      store: createStore({ settings: {}, txs: [...first.txs] }),
    });

    expect(second.txs).toHaveLength(first.txs.length);
  });
});
