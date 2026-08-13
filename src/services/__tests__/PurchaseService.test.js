import Purchases from 'react-native-purchases';

import { PurchaseService } from '../PurchaseService';

jest.mock('expo-constants', () => ({ appOwnership: 'standalone', expoConfig: { extra: {} } }));
jest.mock('react-native-purchases', () => {
  const mock = {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    LOG_LEVEL: { VERBOSE: 'VERBOSE', ERROR: 'ERROR' },
    getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
    purchasePackage: jest.fn(),
  };
  return { __esModule: true, default: mock, ...mock };
});

describe('services/PurchaseService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('settles when the shopper dismisses the store sheet', async () => {
    Purchases.purchasePackage.mockRejectedValue({ userCancelled: true });

    await expect(PurchaseService.buy({})).resolves.toBeUndefined();
  });

  test('does not shout the SDK log into a release build', () => {
    expect(Purchases.setLogLevel).not.toHaveBeenCalledWith('VERBOSE');
  });

  test('rejects a real store failure so the screen can report it', async () => {
    Purchases.purchasePackage.mockRejectedValue({ userCancelled: false, message: 'network down' });

    await expect(PurchaseService.buy({})).rejects.toBeDefined();
  });
});
