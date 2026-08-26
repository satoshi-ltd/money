import { runScheduledSync } from '../runScheduledSync';
import { C } from '../../../modules';
import { NotificationsService } from '../../../services';

jest.mock('../../../services', () => ({
  NotificationsService: { syncScheduled: jest.fn(() => Promise.resolve()) },
}));

const { EXPENSE } = C.TX.TYPE;
const DAY = C.MS_IN_DAY;

// A Wednesday: these cases materialise by weekday, so a real clock makes them pass or fail by the day of the week.
const FROZEN = new Date('2026-08-26T09:00:00Z');

beforeAll(() => jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(FROZEN));
afterAll(() => jest.useRealTimers());

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

  test('can leave notification reconciliation to the caller', async () => {
    const migrated = { accounts: [], scheduledTxs: [], settings: {}, txs: [] };

    const next = await runScheduledSync({
      migrated,
      store: createStore({ settings: {}, txs: [] }),
      syncNotifications: false,
    });

    expect(next).toBe(migrated);
    expect(NotificationsService.syncScheduled).not.toHaveBeenCalled();
  });

  test('does not re-materialise the past when the recurrence was edited', async () => {
    const weekly = {
      ...scheduled('s1', 'a1'),
      startAt: Date.now() - 80 * DAY,
      pattern: { kind: 'weekly', interval: 1, byWeekday: [1] },
    };

    const first = await runScheduledSync({
      migrated: { accounts: [{ hash: 'a1' }], scheduledTxs: [weekly], settings: {}, txs: [] },
      store: createStore({ settings: {}, txs: [] }),
    });
    expect(first.txs.length).toBeGreaterThan(6);

    const edited = { ...weekly, pattern: { kind: 'weekly', interval: 1, byWeekday: [2] }, materialiseFrom: Date.now() };
    const second = await runScheduledSync({
      migrated: { accounts: [{ hash: 'a1' }], scheduledTxs: [edited], settings: {}, txs: first.txs },
      store: createStore({ settings: {}, txs: [...first.txs] }),
    });

    expect(second.txs).toHaveLength(first.txs.length);
  });

  test('still back-fills a template that was never edited', async () => {
    const data = { settings: {}, txs: [] };
    const weekly = {
      ...scheduled('s1', 'a1'),
      startAt: Date.now() - 80 * DAY,
      pattern: { kind: 'weekly', interval: 1, byWeekday: [1] },
    };

    const next = await runScheduledSync({
      migrated: { accounts: [{ hash: 'a1' }], scheduledTxs: [weekly], settings: {}, txs: [] },
      store: createStore(data),
    });

    expect(next.txs.length).toBeGreaterThan(6);
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
