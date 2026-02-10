import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { L10N } from '../modules';
const PRO_ENTITLEMENT = 'pro';

const APIKEY = {
  ios: 'appl_aGBSQTaLCQAEJevVIvbQKAkNKpZ',
  android: 'goog_bzzicUKLHqrXEdrltqKGmdXgyyI',
};

const PREMIUM_MOCK = {
  customerInfo: {
    entitlements: {
      active: {
        pro: {
          identifier: 'pro',
        },
      },
    },
  },
  productIdentifier: 'lifetime',
};

let purchasesInitialized = false;

const initializePurchases = async () => {
  const Purchases = require('react-native-purchases').default;

  if (!purchasesInitialized) {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: APIKEY[Platform.OS] });
    purchasesInitialized = true;
  }

  return Purchases;
};

const getSubscriptionFromCustomerInfo = (customerInfo = {}) => {
  const entitlement = customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT];
  if (!entitlement) return {};

  return {
    customerInfo,
    productIdentifier: entitlement.productIdentifier || entitlement.identifier,
  };
};

export const PurchaseService = {
  getProducts: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve([]);

      try {
        const Purchases = await initializePurchases();

        const offerings = await Purchases.getOfferings();

        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          const plans = Object.fromEntries(
            offerings.current.availablePackages.map((item) => [
              item.identifier,
              {
                data: item,
                productId: item.identifier,
                price: item.product.priceString,
                pricePerMonth: item.product.pricePerMonthString,
                title: item.product.title,
              },
            ]),
          );
          resolve(plans);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  buy: async (plan) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve(PREMIUM_MOCK);

      try {
        const Purchases = await initializePurchases();

        const { customerInfo } = await Purchases.purchasePackage(plan);
        const subscription = getSubscriptionFromCustomerInfo(customerInfo);

        if (subscription.productIdentifier) {
          resolve(subscription);
        } else {
          reject(L10N.ERROR_PURCHASE);
        }
      } catch (error) {
        if (!error.userCancelled) {
          reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
        }
      }
    }),
  restore: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve(PREMIUM_MOCK);

      try {
        const Purchases = await initializePurchases();

        const customerInfo = await Purchases.restorePurchases();
        const subscription = getSubscriptionFromCustomerInfo(customerInfo);

        resolve(subscription);
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  checkSubscription: async (subscription = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || subscription.productIdentifier === 'lifetime') return resolve(true);

      try {
        const Purchases = await initializePurchases();

        const customerInfo = await Purchases.getCustomerInfo();
        resolve(!!getSubscriptionFromCustomerInfo(customerInfo).productIdentifier);
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  syncSubscription: async ({ forceRefresh = false } = {}) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo') return resolve({});

      try {
        const Purchases = await initializePurchases();
        if (forceRefresh) await Purchases.invalidateCustomerInfoCache();

        const customerInfo = await Purchases.getCustomerInfo();
        resolve(getSubscriptionFromCustomerInfo(customerInfo));
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
};
