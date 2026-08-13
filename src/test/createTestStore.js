import { StorageService } from '../services/StorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const memoryAdapter = (seed) =>
  class {
    constructor({ defaults = {} } = {}) {
      this.data = JSON.parse(JSON.stringify({ ...defaults, ...seed }));
      return Promise.resolve(this);
    }

    read() {
      return Promise.resolve(this.data);
    }

    write(data) {
      this.data = data;
      return Promise.resolve();
    }

    wipe() {
      this.data = {};
      return Promise.resolve();
    }
  };

export const createTestStore = (seed = {}) =>
  new StorageService({
    adapter: memoryAdapter(seed),
    defaults: { accounts: [], rates: {}, scheduledTxs: [], settings: {}, subscription: {}, txs: [] },
    filename: 'money',
  });
