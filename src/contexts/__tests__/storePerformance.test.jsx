import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import {
  StoreProvider,
  useAmountSettings,
  useAppPreferences,
  useStoreActions,
  useStoreData,
} from '../store';

const mockConsolidate = jest.fn();
const mockServiceRatesGet = jest.fn(() => Promise.reject(new Error('offline')));

jest.mock('../modules', () => {
  const actual = jest.requireActual('../modules');
  return {
    ...actual,
    consolidate: (...args) => {
      mockConsolidate(...args);
      return actual.consolidate(...args);
    },
  };
});

jest.mock('../../services', () => {
  const data = {
    accounts: [{ balance: 100, currency: 'EUR', hash: 'a1', timestamp: Date.now(), title: 'Wallet' }],
    rates: {},
    scheduledTxs: [],
    settings: {
      baseCurrency: 'EUR',
      language: 'en',
      maskAmount: false,
      onboarded: true,
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

  return {
    NotificationsService: { syncScheduled: jest.fn(() => Promise.resolve()) },
    ratesOrSeed: () => ({ rates: {}, seeded: false }),
    rebaseRates: (rates) => rates,
    ServiceRates: { get: (...args) => mockServiceRatesGet(...args) },
    StorageService,
  };
});

const renders = { amount: 0, data: 0, preferences: 0 };
let actions;

const Probe = () => {
  useStoreData();
  renders.data += 1;
  actions = useStoreActions();
  return null;
};

const PreferencesProbe = React.memo(() => {
  useAppPreferences();
  renders.preferences += 1;
  return null;
});
PreferencesProbe.displayName = 'PreferencesProbe';

const AmountProbe = React.memo(() => {
  useAmountSettings();
  renders.amount += 1;
  return null;
});
AmountProbe.displayName = 'AmountProbe';

describe('contexts/StoreProvider performance boundaries', () => {
  beforeEach(() => {
    mockConsolidate.mockClear();
    mockServiceRatesGet.mockClear();
    renders.amount = 0;
    renders.data = 0;
    renders.preferences = 0;
    actions = undefined;
  });

  test('skips empty consolidation and isolates unrelated settings from visual preferences', async () => {
    let renderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <StoreProvider>
          <Probe />
          <PreferencesProbe />
          <AmountProbe />
        </StoreProvider>,
      );
    });

    expect(mockConsolidate).toHaveBeenCalledTimes(1);
    expect(renders).toEqual({ amount: 1, data: 1, preferences: 1 });

    await act(async () => actions.updateSettings({ statsRangeMonths: 6 }));

    expect(mockConsolidate).toHaveBeenCalledTimes(1);
    expect(renders.data).toBe(2);
    expect(renders.preferences).toBe(1);
    expect(renders.amount).toBe(1);

    await act(async () => renderer.unmount());
  });
});
