import { getOccurrencesBetween } from '../../modules';

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const MAX_PER_SCHEDULED = 8;
const MAX_TOTAL = 48;
const HORIZON_DAYS = 90;
const TOLERANCE = 60 * 1000;

export const notificationKey = ({ scheduledId, occurrenceAt } = {}) => `${scheduledId}:${occurrenceAt}`;

export const scheduledTime = (notification = {}) => {
  const notifyAt = Number(notification?.content?.data?.notifyAt);
  if (Number.isFinite(notifyAt)) return notifyAt;

  const value = notification?.trigger?.value ?? notification?.trigger?.date;
  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : undefined;
};

export const buildDesiredNotifications = ({ now, scheduledTxs = [] } = {}) => {
  const horizonAt = now + HORIZON_DAYS * MS_IN_DAY;
  const desired = [];
  const perScheduledCount = new Map();

  scheduledTxs.forEach((scheduled) => {
    getOccurrencesBetween({ scheduled, fromAt: now, toAt: horizonAt }).forEach((occurrenceAt) => {
      const count = perScheduledCount.get(scheduled.id) || 0;
      if (count >= MAX_PER_SCHEDULED) return;

      const dayBefore = new Date(occurrenceAt - MS_IN_DAY);
      const notifyAt = new Date(
        dayBefore.getFullYear(),
        dayBefore.getMonth(),
        dayBefore.getDate(),
        8,
        0,
        0,
        0,
      ).getTime();
      if (notifyAt <= now + TOLERANCE) return;

      desired.push({ scheduledId: scheduled.id, occurrenceAt, notifyAt });
      perScheduledCount.set(scheduled.id, count + 1);
    });
  });

  return desired.sort((a, b) => a.notifyAt - b.notifyAt).slice(0, MAX_TOTAL);
};

export const reconcileNotifications = ({ desired = [], existing = [], now, txIndex = new Set() } = {}) => {
  const desiredMap = new Map(desired.map((item) => [notificationKey(item), item]));
  const keepKey = new Set();
  const cancelIds = [];

  existing.forEach((item) => {
    const key = notificationKey({
      scheduledId: item?.content?.data?.scheduledId,
      occurrenceAt: item?.content?.data?.occurrenceAt,
    });
    const desiredItem = desiredMap.get(key);
    const scheduledAt = scheduledTime(item);

    if (!desiredItem || txIndex.has(key) || !scheduledAt || scheduledAt <= now + TOLERANCE) {
      cancelIds.push(item.identifier);
      return;
    }

    if (Math.abs(scheduledAt - desiredItem.notifyAt) > TOLERANCE || keepKey.has(key)) {
      cancelIds.push(item.identifier);
      return;
    }

    keepKey.add(key);
  });

  const pending = desired.filter((item) => {
    const key = notificationKey(item);
    return !keepKey.has(key) && !txIndex.has(key);
  });

  return { cancelIds, pending };
};

export const buildTxIndex = (txs = []) =>
  new Set(
    (Array.isArray(txs) ? txs : [])
      .map((tx) => {
        const meta = tx?.meta;
        if (meta?.kind !== 'scheduled') return null;
        if (!meta?.scheduledId || !Number.isFinite(meta?.occurrenceAt)) return null;
        return notificationKey({ scheduledId: meta.scheduledId, occurrenceAt: meta.occurrenceAt });
      })
      .filter(Boolean),
  );
