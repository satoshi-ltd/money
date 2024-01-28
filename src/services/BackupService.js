import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const IS_WEB = Platform.OS === 'web';
const SECONDS_PER_WEEK = 60 * 60 * 24 * 7;

export const BackupService = {
  export: async ({ accounts = [], settings = {}, txs = [] } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const fileName = `money-${new Date().toISOString()}.json`;
        const data = JSON.stringify({ accounts, settings, txs });

        if (IS_WEB) {
          const el = document.createElement('a');
          el.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
          el.download = fileName;
          return el.click();
        }

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) return reject("Unable to export as you don't have sharing permissions.");

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data);
        await Sharing.shareAsync(fileUri);

        resolve(true);

        BackupService.scheduleNotification();
      } catch (error) {
        reject(`Something went wrong: ${JSON.stringify(error)}`);
      }
    }),

  import: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const { cancelled, assets: [file = {}] = [] } = await DocumentPicker.getDocumentAsync({
          multiple: false,
          type: 'application/json',
        });

        if (!cancelled && file.uri) {
          let jsonData = {};

          if (IS_WEB) {
            jsonData = await fetch(file.uri).then((res) => res.json());
          } else {
            const fileData = await FileSystem.readAsStringAsync(file.uri);
            jsonData = JSON.parse(fileData);
          }

          const { accounts = [], settings = {}, txs = [] } = jsonData;

          if (!accounts.length || !Object.keys(settings).length)
            return reject('The file format is not supported. Please choose a compatible file type.');

          resolve({ accounts, settings, txs });
        }
      } catch (error) {
        reject(`Something went wrong: ${JSON.stringify(error)}`);
      }
    }),

  scheduleNotification: async () => {
    if (IS_WEB) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: { title: L10N.SCHEDULE_BACKUP, body: L10N.SCHEDULE_BACKUP_CAPTION },
        trigger: { seconds: SECONDS_PER_WEEK },
      });
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') await BackupService.scheduleNotification();
    }
  },
};
