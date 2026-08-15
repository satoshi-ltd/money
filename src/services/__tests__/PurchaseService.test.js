import Purchases from 'react-native-purchases';

import { PurchaseService } from '../PurchaseService';
import { C } from '../../modules';

jest.mock('expo-constants', () => ({ appOwnership: 'standalone', expoConfig: { extra: {} } }));
jest.mock('react-native-purchases', () => {
  const mock = {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    LOG_LEVEL: { VERBOSE: 'VERBOSE', ERROR: 'ERROR' },
    getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    getOfferings: jest.fn(() => Promise.resolve({ current: null })),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  };
  return { __esModule: true, default: mock, ...mock };
});

const withPremiumEnabled = () => {
  let service;
  jest.isolateModules(() => {
    jest.doMock('../../modules', () => ({ ...jest.requireActual('../../modules'), PREMIUM_ENABLED: true }));
    service = require('../PurchaseService').PurchaseService;
  });
  return service;
};

describe('services/PurchaseService with subscriptions switched off', () => {
  beforeEach(() => jest.clearAllMocks());

  test('never reaches the store', async () => {
    await PurchaseService.getProducts();
    await PurchaseService.buy({});
    await PurchaseService.restore();
    await PurchaseService.syncSubscription();

    expect(Purchases.configure).not.toHaveBeenCalled();
    expect(Purchases.purchasePackage).not.toHaveBeenCalled();
    expect(Purchases.getOfferings).not.toHaveBeenCalled();
    expect(Purchases.restorePurchases).not.toHaveBeenCalled();
  });

  test('offers no plans to buy', async () => {
    await expect(PurchaseService.getProducts()).resolves.toEqual([]);
  });

  test('treats everyone as entitled', async () => {
    await expect(PurchaseService.checkSubscription({})).resolves.toBe(true);
  });
});

describe('services/PurchaseService when subscriptions come back', () => {
  beforeEach(() => jest.clearAllMocks());

  test('settles when the shopper dismisses the store sheet', async () => {
    Purchases.purchasePackage.mockRejectedValue({ userCancelled: true });

    await expect(withPremiumEnabled().buy({})).resolves.toBeUndefined();
  });

  test('rejects a real store failure so the screen can report it', async () => {
    Purchases.purchasePackage.mockRejectedValue({ userCancelled: false, message: 'network down' });

    await expect(withPremiumEnabled().buy({})).rejects.toBeDefined();
  });

  test('keeps the SDK log level tied to the build, not hardcoded to verbose', async () => {
    Purchases.purchasePackage.mockRejectedValue({ userCancelled: true });

    await withPremiumEnabled().buy({});

    expect(Purchases.setLogLevel).toHaveBeenCalledWith(C.IS_DEV ? 'VERBOSE' : 'ERROR');
  });
});
