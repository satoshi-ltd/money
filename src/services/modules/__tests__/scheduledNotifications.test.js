import {
  buildDesiredNotifications,
  buildTxIndex,
  notificationKey,
  reconcileNotifications,
  scheduledTime,
} from '../scheduledNotifications';
import { C } from '../../../modules';

const DAY = C.MS_IN_DAY;
const NOW = new Date(2026, 0, 10, 9, 0, 0, 0).getTime();

const monthly = (id, day) => ({
  id,
  account: 'a1',
  category: 1,
  type: C.TX.TYPE.EXPENSE,
  value: 100,
  startAt: NOW - 60 * DAY,
  pattern: { kind: 'monthly', interval: 1, byMonthDay: day },
});

const asNotification = ({ identifier, item, trigger }) => ({
  identifier,
  content: { data: { kind: 'scheduled-tx', ...item } },
  trigger,
});

describe('services/modules/scheduledNotifications', () => {
  test('announces each occurrence the day before at 8am', () => {
    const [first] = buildDesiredNotifications({ now: NOW, scheduledTxs: [monthly('s1', 20)] });

    expect(new Date(first.occurrenceAt).getDate()).toBe(20);
    expect(new Date(first.notifyAt).getDate()).toBe(19);
    expect(new Date(first.notifyAt).getHours()).toBe(8);
  });

  test('never queues more than eight reminders per template', () => {
    const desired = buildDesiredNotifications({ now: NOW, scheduledTxs: [monthly('s1', 20)] });

    expect(desired.length).toBeLessThanOrEqual(8);
  });

  test('reads the delivery time from the payload when the trigger does not carry it', () => {
    const notifyAt = NOW + 3 * DAY;

    expect(scheduledTime({ content: { data: { notifyAt } }, trigger: { type: 'calendar', dateComponents: {} } })).toBe(
      notifyAt,
    );
    expect(scheduledTime({ trigger: { type: 'date', value: notifyAt } })).toBe(notifyAt);
    expect(scheduledTime({ trigger: { type: 'calendar', dateComponents: {} } })).toBeUndefined();
  });

  test('keeps a reminder that is already scheduled for the right moment', () => {
    const desired = buildDesiredNotifications({ now: NOW, scheduledTxs: [monthly('s1', 20)] });
    const existing = desired.map((item, index) =>
      asNotification({ identifier: `id-${index}`, item, trigger: { type: 'calendar', dateComponents: {} } }),
    );

    const { cancelIds, pending } = reconcileNotifications({ desired, existing, now: NOW });

    expect(cancelIds).toEqual([]);
    expect(pending).toEqual([]);
  });

  test('replaces a reminder whose moment moved', () => {
    const desired = buildDesiredNotifications({ now: NOW, scheduledTxs: [monthly('s1', 20)] });
    const [first] = desired;
    const existing = [
      asNotification({
        identifier: 'stale',
        item: { ...first, notifyAt: first.notifyAt - DAY },
        trigger: { type: 'date', value: first.notifyAt - DAY },
      }),
    ];

    const { cancelIds, pending } = reconcileNotifications({ desired, existing, now: NOW });

    expect(cancelIds).toEqual(['stale']);
    expect(pending).toContainEqual(first);
  });

  test('drops the reminder of an occurrence already recorded as a transaction', () => {
    const desired = buildDesiredNotifications({ now: NOW, scheduledTxs: [monthly('s1', 20)] });
    const [first] = desired;
    const existing = [asNotification({ identifier: 'done', item: first, trigger: { type: 'date', value: first.notifyAt } })];
    const txIndex = buildTxIndex([
      { hash: 't1', meta: { kind: 'scheduled', scheduledId: first.scheduledId, occurrenceAt: first.occurrenceAt } },
    ]);

    const { cancelIds, pending } = reconcileNotifications({ desired, existing, now: NOW, txIndex });

    expect(cancelIds).toEqual(['done']);
    expect(pending.map(notificationKey)).not.toContain(notificationKey(first));
  });

  test('cancels a reminder for a template that no longer exists', () => {
    const existing = [
      asNotification({
        identifier: 'orphan',
        item: { scheduledId: 'gone', occurrenceAt: NOW + 5 * DAY, notifyAt: NOW + 4 * DAY },
        trigger: { type: 'date', value: NOW + 4 * DAY },
      }),
    ];

    expect(reconcileNotifications({ desired: [], existing, now: NOW }).cancelIds).toEqual(['orphan']);
  });
});
