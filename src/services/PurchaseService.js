import Constants from 'expo-constants';

import { C, L10N } from '../modules';

const { PRODUCTION, SANDBOX } = C.APPLE;

export const PurchaseService = {
  getProducts: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve([]);

      const InAppPurchases = require('expo-in-app-purchases');

      try {
        await InAppPurchases.connectAsync();

        const { responseCode, results } = await InAppPurchases.getProductsAsync(['monthly', 'yearly', 'lifetime']);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          resolve(
            results.sort((a, b) => {
              return a.priceAmountMicros - b.priceAmountMicros;
            }),
          );
        } else {
          reject(L10N.ERROR_PRODUCTS);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      } finally {
        await InAppPurchases.disconnectAsync();
      }
    }),
  buy: async (productId) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve({ productId: 'lifetime' });

      const InAppPurchases = require('expo-in-app-purchases');

      try {
        await InAppPurchases.connectAsync();

        await InAppPurchases.getProductsAsync([productId]);

        InAppPurchases.purchaseItemAsync(productId);

        InAppPurchases.setPurchaseListener(async (result) => {
          switch (result.responseCode) {
            case InAppPurchases.IAPResponseCode.OK:
            case InAppPurchases.IAPResponseCode.DEFERRED:
              await InAppPurchases.finishTransactionAsync(result.results[0], false);
              resolve(result.results[0]);
              break;
            case InAppPurchases.IAPResponseCode.USER_CANCELED:
              resolve(false);
              break;
            case InAppPurchases.IAPResponseCode.ERROR:
              reject(new Error('IAP Error: ' + result.errorCode));
              break;
          }
          await InAppPurchases.disconnectAsync();
        });
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  restore: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve();

      const InAppPurchases = require('expo-in-app-purchases');

      try {
        await InAppPurchases.connectAsync();

        const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          const activeSubscription = results.find(
            ({ acknowledged, purchaseState }) =>
              acknowledged &&
              [InAppPurchases.InAppPurchaseState.PURCHASED, InAppPurchases.InAppPurchaseState.RESTORED].includes(
                purchaseState,
              ),
          );
          resolve(activeSubscription);
        } else {
          reject(L10N.ERROR_RESTORE);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      } finally {
        await InAppPurchases.disconnectAsync();
      }
    }),
  checkSubscription: async (subscription, sandbox = false) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (subscription.productId === 'lifetime') return resolve(true);

      fetch(!sandbox ? PRODUCTION : SANDBOX, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'POST',
        body: JSON.stringify({
          'receipt-data': subscription.transactionReceipt,
          password: process.env.EXPO_PUBLIC_APPLE_SHARED_SECRET,
          'exclude-old-transactions': true,
        }),
      })
        .then(async (response) => {
          const json = await response.json();

          if (json.status === 21007) {
            return PurchaseService.checkSubscription(subscription, true);
          }
          if (json.status !== 0) {
            return resolve(false);
          }

          const latestExpirationDate = json.latest_receipt_info
            .map((info) => new Date(info.expires_date_ms))
            .reduce((latest, current) => (current > latest ? current : latest), new Date(0));

          resolve(latestExpirationDate > new Date());
        })
        .catch(({ message = L10N.ERROR_TRY_AGAIN, response } = {}) => {
          reject({
            code: response ? response.status : 500,
            message,
          });
        });
    }),
};
