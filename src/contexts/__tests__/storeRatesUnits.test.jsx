import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { StoreProvider, useStoreData } from '../store';

jest.mock('../../services', () => {
  // XAU at a thirty-first of its worth: the per-gram table the backend before the public feed served.
  const data = {
    accounts: [],
    rates: { '2026-08': { USD: 1, EUR: 0.86, XAU: 0.00674 } },
    scheduledTxs: [],
    settings: {
      baseCurrency: 'USD',
      language: 'en',
      onboarded: true,
      // Already matching, so nothing rebases on boot and only the wipe keeps the stale table off the disk.
      ratesBaseCurrency: 'USD',
      schemaVersion: 3,
      theme: 'light',
    },
    txs: [],
  };

  class StorageService {
    constructor() {
      return Promise.resolve(this);
    }

    get(key) {
      return {
        get value() {
          return data[key];
        },
        save: async (value) => {
          data[key] = Array.isArray(data[key]) ? value : { ...data[key], ...value };
          return value;
        },
      };
    }

    async wipe(key) {
      data[key] = Array.isArray(data[key]) ? [] : {};
    }
  }

  // Lazily: requiring the real module while this factory runs pulls the barrel back through itself.
  const rates = () => jest.requireActual('../../services/RatesService');

  return {
    ratesOrSeed: (...args) => rates().ratesOrSeed(...args),
    rebaseRates: (...args) => rates().rebaseRates(...args),
    NotificationsService: { init: jest.fn(), syncScheduled: jest.fn(() => Promise.resolve()) },
    ServiceRates: { get: jest.fn(() => Promise.reject(new Error('offline'))) },
    StorageService,
    __data: data,
  };
});

let captured;
let renderer;

const Probe = () => {
  captured = useStoreData();
  return null;
};

describe('contexts/StoreProvider rates units', () => {
  // The provider keeps an interval and an AppState listener alive: leave one mounted and jest never exits.
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    renderer = undefined;
  });

  test('a cache from before the metals moved to ounces reaches neither the ledger nor the next boot', async () => {
    await act(async () => {
      renderer = TestRenderer.create(
        <StoreProvider>
          <Probe />
        </StoreProvider>,
      );
    });

    // eslint-disable-next-line global-require
    const { __data: data } = require('../../services');

    // An ounce of gold is worth thousands and a gram hundreds, which is the whole difference the cache got wrong.
    expect(1 / captured.rates['2026-08'].XAU).toBeGreaterThan(1000);
    expect(data.rates['2026-08']).toBeUndefined();
    expect(data.settings.schemaVersion).toBe(4);
  });
});
