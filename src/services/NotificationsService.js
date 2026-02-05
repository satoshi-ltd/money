import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const GRANTED = 'granted';
const NOTIFICATION_KIND = {
  BACKUP: 'backup-reminder',
};

export const NotificationsService = {
  init: async () => {
    await NotificationsService.reminders();
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
};
