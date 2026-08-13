import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { buildDesiredNotifications, buildTxIndex, reconcileNotifications } from './modules/scheduledNotifications';
import { L10N } from '../modules';

const GRANTED = 'granted';
const NOTIFICATION_KIND = {
  BACKUP: 'backup-reminder',
  SCHEDULED: 'scheduled-tx',
};

const IS_EXPO_GO_ANDROID = Platform.OS === 'android' && Constants.appOwnership === 'expo';

let _Notifications;
const getNotifications = async () => {
  if (IS_EXPO_GO_ANDROID) return null;
  if (_Notifications) return _Notifications;
  _Notifications = await import('expo-notifications');
  return _Notifications;
};

const resolveDateTrigger = (Notifications, date) => {
  const resolved = date instanceof Date ? date : new Date(date);
  return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: resolved };
};

export const NotificationsService = {
  init: async ({ reminders, scheduledTxs, txs } = {}) => {
    await NotificationsService.reminders(reminders);
    await NotificationsService.syncScheduled({ scheduledTxs, txs });
  },

  notifyPremiumUnlocked: async () => {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;
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
    } catch {
      return;
    }
  },

  clearAll: async () => {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;
      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== GRANTED) return;

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const ours = scheduled.filter((item) => {
        const kind = item?.content?.data?.kind;
        return kind === NOTIFICATION_KIND.BACKUP || kind === NOTIFICATION_KIND.SCHEDULED;
      });

      await Promise.all(ours.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    } catch {
      return;
    }
  },

  permission: async () => {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return false;
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
    } catch {
      return false;
    }
  },

  reminders: async ([backup = 1] = []) => {
    if (!(await NotificationsService.permission())) return;
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;

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
          trigger: { hour: 8, minute: 0, weekday: 1, type: Notifications.SchedulableTriggerInputTypes.WEEKLY },
        });
      }
    } catch {
      return;
    }
  },

  syncScheduled: async ({ scheduledTxs = [], txs = [] } = {}) => {
    if (!(await NotificationsService.permission())) return;
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;

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

      const desired = buildDesiredNotifications({ now, scheduledTxs: source });

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const existing = scheduled.filter((item) => item?.content?.data?.kind === NOTIFICATION_KIND.SCHEDULED);

      const { cancelIds, pending } = reconcileNotifications({
        desired,
        existing,
        now,
        txIndex: buildTxIndex(txs),
      });

      if (cancelIds.length) {
        await Promise.all(cancelIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
      }

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
                notifyAt: item.notifyAt,
              },
            },
            trigger: resolveDateTrigger(Notifications, new Date(item.notifyAt)),
          }),
        ),
      );
    } catch {
      return;
    }
  },
};
