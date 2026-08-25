import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { DashboardListHeader } from '../Dashboard.ListHeader';

const mockUpdateSettings = jest.fn();
let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Delta: stub('delta'),
    Heading: stub('heading'),
    Icon: stub('icon'),
    InputField: stub('input-field'),
    Masthead: stub('masthead'),
    MonthSummary: stub('month-summary'),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    PriceFriendly: stub('price'),
    Text: ({ figure, medium, size, tone, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ row, flex, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const account = (hash, title, currency, currentBalance) => ({
  hash,
  title,
  currency,
  currentBalance,
  currentBalanceBase: currentBalance,
  currentMonth: { progressionCurrency: 0 },
  chartBalanceBase: [],
  txs: [],
});

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<DashboardListHeader navigate={() => {}} onSearch={() => {}} setPage={() => {}} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Dashboard/ListHeader', () => {
  beforeEach(() => {
    mockUpdateSettings.mockClear();
    mockStore = {
      accounts: [
        account('a1', 'N26', 'EUR', 8412.9),
        account('a2', 'Savings', 'EUR', 13922.4),
        account('a3', 'Revolut', 'USD', 2140.55),
        account('a4', 'Cash', 'EUR', 310),
      ],
      overall: { currentBalance: 24618.42, currentMonth: { progression: 1132 }, chartBalance: [] },
      rates: {},
      scheduledTxs: [],
      settings: { baseCurrency: 'EUR' },
      today: new Date(2026, 7, 23),
      txs: [],
      updateSettings: mockUpdateSettings,
    };
  });

  test('the net worth is the hero figure, in the mono ramp', () => {
    const hero = componentsBy(render(), 'price').find((node) => node.props.size === 'hero');

    expect(hero.props.value).toBe(24618.42);
    expect(hero.props.bold).toBe(true);
  });

  test('tapping the hero toggles the amount mask', () => {
    const root = render();
    componentsBy(root, 'pressable')
      .filter((node) => node.props.onPress)
      .forEach((node) => act(() => node.props.onPress()));

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ maskAmount: true });
  });

  test('only the first three accounts are listed, largest balance first', () => {
    const balances = componentsBy(render(), 'price').filter((node) => node.props.size === 'lg');

    expect(balances).toHaveLength(3);
    expect(balances.map((node) => node.props.value)).toEqual([13922.4, 8412.9, 2140.55]);
  });

  test('a foreign-currency account shows its converted amount', () => {
    const converted = componentsBy(render(), 'price').filter(
      (node) => node.props.currency === 'EUR' && node.props.size === 'xs',
    );

    expect(converted).toHaveLength(1);
  });

  test('hides the hero when there are no accounts', () => {
    mockStore = { ...mockStore, accounts: [] };

    const hero = componentsBy(render(), 'price').filter((node) => node.props.size === 'hero');

    expect(hero).toHaveLength(0);
  });
});
