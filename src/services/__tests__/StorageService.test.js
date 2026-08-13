import { StorageService } from '../StorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const workingAdapter = (data) =>
  class {
    constructor() {
      return Promise.resolve(this);
    }

    read() {
      return Promise.resolve(data);
    }

    write() {
      return Promise.resolve();
    }
  };

const failingOn = (stage) =>
  class {
    constructor() {
      if (stage === 'constructor') return Promise.reject(new Error('store could not be opened'));
      return Promise.resolve(this);
    }

    read() {
      return Promise.reject(new Error('Row too big to fit into CursorWindow'));
    }
  };

describe('services/StorageService', () => {
  test('resolves with the stored data when everything works', async () => {
    const store = await new StorageService({ adapter: workingAdapter({ txs: [{ hash: 't1' }] }), filename: 'money' });

    expect(store.get('txs').value).toEqual([{ hash: 't1' }]);
  });

  test('rejects when the data cannot be read, instead of never settling', async () => {
    await expect(new StorageService({ adapter: failingOn('read'), filename: 'money' })).rejects.toThrow(
      'Row too big to fit into CursorWindow',
    );
  });

  test('rejects when the storage cannot even be opened', async () => {
    await expect(new StorageService({ adapter: failingOn('constructor'), filename: 'money' })).rejects.toThrow(
      'store could not be opened',
    );
  });
});
