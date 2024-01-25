import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SECONDS_PER_WEEK = 7 * 24 * 60 * 60;

export const setNextNotification = async () => {
  if (IS_WEB) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Secure Your Finances!',
        body: "Don't forget to perform your weekly backup. Keep your financial information safe and up-to-date. It's quick and easy. Do it now!",
      },
      trigger: {
        seconds: SECONDS_PER_WEEK,
      },
    });
  } else {
    await requestNotificationPermission();
  }
};

export const requestNotificationPermission = async () => {
  if (IS_WEB) return;
  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    await setNextNotification();
  }
};
