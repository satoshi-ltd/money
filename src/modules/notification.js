import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const SECONDS_PER_WEEK = 7 * 24 * 60 * 60;

export const setNextNotification = async () => {
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
  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    await setNextNotification();
  }
};
