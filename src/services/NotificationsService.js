import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getOccurrencesBetween, L10N } from '../modules';

const GRANTED = 'granted';
const NOTIFICATION_KIND = {
  BACKUP: 'backup-reminder',
  SCHEDULED: 'scheduled-tx',
};

// Expo Notifications deprecated passing a Date directly as trigger input.
// Use explicit `{ type: 'date', date: Date }` instead.
const resolveDateTrigger = (date) => {
  const resolved = date instanceof Date ? date : new Date(date);
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: resolved };
};
const notificationKey = ({ scheduledId, occurrenceAt } = {}) => `${scheduledId}:${occurrenceAt}`;
const triggerTime = (notification = {}) => {
  const value = notification?.trigger?.value ?? notification?.trigger?.date;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : undefined;
};

export const NotificationsService = {
  init: async ({ reminders, scheduledTxs, txs } = {}) => {
    await NotificationsService.reminders(reminders);
    await NotificationsService.syncScheduled({ scheduledTxs, txs });
  },

  notifyPremiumUnlocked: async () => {
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== GRANTED) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: L10N.PREMIUM_UNLOCKED_TITLE,
        body: L10N.PREMIUM_UNLOCKED_CAPTION,
        sound: true,
        data: { kind: 'btc-premium' },
      },
      trigger: null,
    });
  },

  clearAll: async () => {
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== GRANTED) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ours = scheduled.filter((item) => {
      const kind = item?.content?.data?.kind;
      return kind === NOTIFICATION_KIND.BACKUP || kind === NOTIFICATION_KIND.SCHEDULED;
    });

    await Promise.all(ours.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
  },

  permission: async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== GRANTED) {
      const requestPermission = await Notifications.requestPermissionsAsync();
      if (requestPermission.status !== GRANTED) return false;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
    });

    return true;
  },

  reminders: async ([backup = 1] = []) => {
    if (!(await NotificationsService.permission())) return;

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const backupNotifications = scheduled.filter((item) => item?.content?.data?.kind === NOTIFICATION_KIND.BACKUP);
    await Promise.all(
      backupNotifications.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
    );

    if (backup) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: L10N.SCHEDULE_BACKUP,
          body: L10N.SCHEDULE_BACKUP_CAPTION,
          sound: true,
          data: { kind: NOTIFICATION_KIND.BACKUP },
        },
        trigger: { hour: 8, minute: 0, weekday: 7, type: Notifications.SchedulableTriggerInputTypes.WEEKLY },
      });
    }
  },

  syncScheduled: async ({ scheduledTxs = [], txs = [] } = {}) => {
    if (!(await NotificationsService.permission())) return;

    const now = Date.now();
    const source = Array.isArray(scheduledTxs) ? scheduledTxs : [];
    if (!source.length) {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledNotifications = scheduled.filter(
        (item) => item?.content?.data?.kind === NOTIFICATION_KIND.SCHEDULED,
      );
      await Promise.all(
        scheduledNotifications.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
      );
      return;
    }

    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const MAX_PER_SCHEDULED = 8;
    const MAX_TOTAL = 48;

    const horizonAt = now + 90 * MS_IN_DAY;
    const desired = [];
    const perScheduledCount = new Map();

    source.forEach((scheduled) => {
      const occurrences = getOccurrencesBetween({ scheduled, fromAt: now, toAt: horizonAt });
      occurrences.forEach((occurrenceAt) => {
        const count = perScheduledCount.get(scheduled.id) || 0;
        if (count >= MAX_PER_SCHEDULED) return;

        const dayBefore = occurrenceAt - MS_IN_DAY;
        const notifyDate = new Date(dayBefore);
        const notifyAt = new Date(
          notifyDate.getFullYear(),
          notifyDate.getMonth(),
          notifyDate.getDate(),
          8,
          0,
          0,
          0,
        ).getTime();
        if (notifyAt <= now + 60 * 1000) return;

        desired.push({ scheduledId: scheduled.id, occurrenceAt, notifyAt });
        perScheduledCount.set(scheduled.id, count + 1);
      });
    });

    desired.sort((a, b) => a.notifyAt - b.notifyAt);
    const capped = desired.slice(0, MAX_TOTAL);
    const desiredMap = new Map(capped.map((item) => [notificationKey(item), item]));

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduledNotifications = scheduled.filter(
      (item) => item?.content?.data?.kind === NOTIFICATION_KIND.SCHEDULED,
    );

    const txIndex = new Set(
      (Array.isArray(txs) ? txs : [])
        .map((tx) => {
          const meta = tx?.meta;
          if (meta?.kind !== 'scheduled') return null;
          if (!meta?.scheduledId || !Number.isFinite(meta?.occurrenceAt)) return null;
          return `${meta.scheduledId}:${meta.occurrenceAt}`;
        })
        .filter(Boolean),
    );

    const keepKey = new Set();
    const cancelIds = [];
    scheduledNotifications.forEach((item) => {
      const scheduledId = item?.content?.data?.scheduledId;
      const occurrenceAt = item?.content?.data?.occurrenceAt;
      const key = notificationKey({ scheduledId, occurrenceAt });
      const desiredItem = desiredMap.get(key);
      const scheduledAt = triggerTime(item);

      if (!desiredItem || txIndex.has(key) || !scheduledAt || scheduledAt <= now + 60 * 1000) {
        cancelIds.push(item.identifier);
        return;
      }

      if (Math.abs(scheduledAt - desiredItem.notifyAt) > 60000 || keepKey.has(key)) {
        cancelIds.push(item.identifier);
        return;
      }

      keepKey.add(key);
    });

    if (cancelIds.length) {
      await Promise.all(cancelIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    }

    const pending = capped.filter((item) => {
      const key = notificationKey(item);
      return !keepKey.has(key) && !txIndex.has(key);
    });

    await Promise.all(
      pending.map((item) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: L10N.SCHEDULED,
            body: L10N.SCHEDULED_NOTIFICATION_CAPTION,
            sound: true,
            data: {
              kind: NOTIFICATION_KIND.SCHEDULED,
              scheduledId: item.scheduledId,
              occurrenceAt: item.occurrenceAt,
            },
          },
          trigger: resolveDateTrigger(new Date(item.notifyAt)),
        }),
      ),
    );
  },
};
