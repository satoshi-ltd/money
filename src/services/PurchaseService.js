import Constants from 'expo-constants';

export const PurchaseService = {
  getProducts: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve();

      const InAppPurchases = require('expo-in-app-purchases');

      try {
        await InAppPurchases.connectAsync();

        const { responseCode, results } = await InAppPurchases.getProductsAsync(['monthly', 'yearly', 'lifetime']);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          resolve(results);
        } else {
          reject('Products not found');
        }
      } catch (error) {
        reject(`Something went wrong: ${JSON.stringify(error)}`);
      } finally {
        await InAppPurchases.disconnectAsync();
      }
    }),
  buy: async (productId) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve();

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
              await InAppPurchases.disconnectAsync();
              return resolve(result.results[0]);
            case InAppPurchases.IAPResponseCode.USER_CANCELED:
              await InAppPurchases.disconnectAsync();
              return resolve(false);
            case InAppPurchases.IAPResponseCode.ERROR:
              await InAppPurchases.disconnectAsync();
              return reject(new Error('IAP Error: ' + result.errorCode));
          }
        });
      } catch (error) {
        reject(`Something went wrong: ${JSON.stringify(error)}`);
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
        alert(`result ${JSON.stringify(results)}`);
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          // TODO creo que tenemos que mirar si es monthly que el purchaseTime sea menos de un mes y en year menos de un año
          const activeSubscription = results.find(
            ({ acknowledged, purchaseState }) =>
              acknowledged &&
              [InAppPurchases.InAppPurchaseState.PURCHASED, InAppPurchases.InAppPurchaseState.RESTORED].includes(
                purchaseState,
              ),
          );
          resolve(activeSubscription);
        } else {
          reject('Restore failed');
        }
      } catch (error) {
        reject(`Something went wrong: ${JSON.stringify(error)}`);
      } finally {
        await InAppPurchases.disconnectAsync();
      }
    }),
  checkSubscription: async (subscription) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      fetch(`https://buy.itunes.apple.com/verifyReceipt`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'POST',
        body: JSON.stringify({ receipt_data: subscription.transactionReceipt }),
      })
        .then(async (response) => {
          const json = await response.json();

          if (response.status >= 400) reject({ code: response.status, message: json.message });
          else alert(JSON.stringify(json));
          resolve(json);
        })
        .catch(({ message = 'Something wrong happened. Try again.', response } = {}) => {
          reject({
            code: response ? response.status : 500,
            message,
          });
        });
    }),
};
