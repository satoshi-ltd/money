import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { StoreProvider, useStore } from '../store';

jest.mock('../../services', () => {
  const data = {
    accounts: [],
    rates: { '2026-08': { USD: 1, EUR: 0.86 } },
    scheduledTxs: [],
    settings: {
      baseCurrency: 'USD',
      language: 'en',
      lastRatesUpdate: new Date('2020-01-01T00:00:00Z'),
      onboarded: true,
      ratesBaseCurrency: 'USD',
      schemaVersion: 4,
      theme: 'light',
    },
    txs: [],
  };
  const download = { release: undefined };

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

  const rates = () => jest.requireActual('../../services/RatesService');

  return {
    ratesOrSeed: (...args) => rates().ratesOrSeed(...args),
    rebaseRates: (...args) => rates().rebaseRates(...args),
    NotificationsService: { init: jest.fn(), setHour: jest.fn(), syncScheduled: jest.fn(() => Promise.resolve()) },
    ServiceRates: {
      get: jest.fn(
        () =>
          new Promise((resolve) => {
            download.release = resolve;
          }),
      ),
    },
    StorageService,
    __data: data,
    __download: download,
  };
});

let captured;
let renderer;

const Probe = () => {
  captured = useStore();
  return null;
};

describe('contexts/StoreProvider rates download in flight', () => {
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    renderer = undefined;
  });

  test('a download that answers after the base currency changed is dropped', async () => {
    // eslint-disable-next-line global-require
    const { __data: data, __download: download } = require('../../services');

    await act(async () => {
      renderer = TestRenderer.create(
        <StoreProvider>
          <Probe />
        </StoreProvider>,
      );
    });
    expect(download.release).toBeDefined();

    await act(async () => {
      await captured.updateSettings({ baseCurrency: 'EUR' });
    });
    expect(captured.settings.baseCurrency).toBe('EUR');
    expect(data.settings.ratesBaseCurrency).toBe('EUR');

    await act(async () => {
      download.release({ currency: 'USD', '2026-11': { USD: 1, EUR: 0.9 } });
    });

    expect(captured.settings.baseCurrency).toBe('EUR');
    expect(data.settings.baseCurrency).toBe('EUR');
    expect(data.settings.ratesBaseCurrency).toBe('EUR');
    expect(data.rates['2026-11']).toBeUndefined();
  });

  test('the dropped download is asked again for the base currency the reader chose', async () => {
    // eslint-disable-next-line global-require
    const { ServiceRates, __download: download } = require('../../services');
    ServiceRates.get.mockClear();

    await act(async () => {
      renderer = TestRenderer.create(
        <StoreProvider>
          <Probe />
        </StoreProvider>,
      );
    });
    await act(async () => {
      await captured.updateSettings({ baseCurrency: 'GBP' });
    });
    await act(async () => {
      download.release({ currency: 'EUR', '2026-11': { EUR: 1, GBP: 0.9 } });
    });

    expect(ServiceRates.get.mock.calls.at(-1)[0].baseCurrency).toBe('GBP');
  });
});
