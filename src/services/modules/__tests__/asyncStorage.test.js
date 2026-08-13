import AsyncStorage from '@react-native-async-storage/async-storage';

import { AsyncStorageAdapter } from '../asyncStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('services/modules/asyncStorage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('resolves only once the payload reached storage', async () => {
    const order = [];
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({}));
    AsyncStorage.setItem.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            order.push('written');
            resolve();
          }, 10),
        ),
    );

    const adapter = await new AsyncStorageAdapter({ filename: 'money' });
    await adapter.write({ txs: [] });
    order.push('resolved');

    expect(order).toEqual(['written', 'resolved']);
  });

  test('surfaces a storage failure instead of swallowing it', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({}));
    const adapter = await new AsyncStorageAdapter({ filename: 'money' });

    AsyncStorage.setItem.mockRejectedValue(new Error('disk full'));

    await expect(adapter.write({ txs: [] })).rejects.toThrow('money could not be saved correctly.');
  });
});
