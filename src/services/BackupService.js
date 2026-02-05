import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { SCHEMA_VERSION } from '../contexts/store.constants';
import { L10N } from '../modules';

export const BackupService = {
  export: async ({ accounts = [], settings = {}, txs = [] } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const fileName = `money-${new Date().toISOString()}.json`;
        const schemaVersion = settings?.schemaVersion || SCHEMA_VERSION;
        const data = JSON.stringify({ schemaVersion, accounts, settings, txs });

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) return reject(L10N.ERROR_EXPORT);

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data);
        await Sharing.shareAsync(fileUri);

        resolve(true);
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),

  exportCsv: async ({ accounts = [], settings = {}, txs = [] } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const fileName = `money-${new Date().toISOString()}.csv`;
        const accountMap = new Map(accounts.map((account) => [account.hash, account]));
        const rows = [['date', 'type', 'amount', 'currency', 'category', 'title', 'account'].join(',')];

        txs.forEach(({ timestamp, type, value, category, title, account }) => {
          const date = new Date(timestamp || Date.now()).toISOString();
          const accountInfo = accountMap.get(account);
          const accountTitle = accountInfo?.title || account || '';
          const accountCurrency = accountInfo?.currency || settings.baseCurrency || '';
          const safeTitle = `${title || ''}`.replace(/\"/g, '""');
          rows.push(
            [date, type, value, accountCurrency, category ?? '', `"${safeTitle}"`, `"${accountTitle}"`].join(','),
          );
        });

        const data = rows.join('\\n');

        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (!isSharingAvailable) return reject(L10N.ERROR_EXPORT);

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, data);
        await Sharing.shareAsync(fileUri);

        resolve(true);
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),

  import: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      try {
        const { cancelled, assets = [] } = await DocumentPicker.getDocumentAsync({
          multiple: false,
          type: 'application/json',
        });
        const file = assets && assets[0] ? assets[0] : {};

        if (!cancelled && file.uri) {
          let jsonData = {};

          const fileData = await FileSystem.readAsStringAsync(file.uri);
          jsonData = JSON.parse(fileData);

          const { accounts = [], schemaVersion, settings = {}, txs = [] } = jsonData;

          if (!accounts.length || !Object.keys(settings).length) return reject(L10N.ERROR_IMPORT);

          resolve({ accounts, schemaVersion, settings, txs });
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
};
