import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Transactions } from '../Transactions';
import { L10N } from '../../../modules';

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../Transactions.ListHeader', () => ({ TransactionsListHeader: () => null }));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Button: stub('button'),
    EmptyState: stub('empty'),
    FloatingAdd: stub('floating-add'),
    Panel: ({ children, floatingElement, rightElement, title }) =>
      MockReact.createElement(ReactNative.View, { testID: 'panel', title }, rightElement, children, floatingElement),
    TransactionItem: stub('item'),
    TransactionsHeader: stub('day'),
  };
});

const ACCOUNTS = [
  { currency: 'THB', hash: 'a1', title: 'Wallet' },
  { currency: 'USD', hash: 'a2', title: 'Chase' },
];
const tx = (hash, account, category, date, value = 10) => ({ account, category, hash, timestamp: date.getTime(), title: hash, type: 0, value });

let renderer;
const navigate = jest.fn();
const render = (params) => {
  act(() => {
    renderer = TestRenderer.create(<Transactions navigation={{ goBack: () => {}, navigate }} route={{ params }} />);
  });
  return renderer.root;
};
const nodes = (root, testID) => root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Transactions by category', () => {
  beforeEach(() => {
    mockStore = {
      accounts: ACCOUNTS,
      rates: {},
      settings: { baseCurrency: 'USD' },
      txs: [
        tx('coffee', 'a1', 10, new Date(2026, 8, 8)),
        tx('barber', 'a2', 10, new Date(2026, 8, 4)),
        tx('august', 'a1', 10, new Date(2026, 7, 30)),
        tx('bread', 'a1', 1, new Date(2026, 8, 8)),
      ],
    };
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    navigate.mockClear();
  });

  test('lists only that category in that month, each entry in its own account currency', () => {
    const root = render({ category: 10, month: 8, type: 0, year: 2026 });
    const items = nodes(root, 'item');

    expect(items.map((node) => node.props.title).sort()).toEqual(['barber', 'coffee']);
    expect(items.find((node) => node.props.title === 'coffee').props.currency).toBe('THB');
    expect(items.find((node) => node.props.title === 'barber').props.currency).toBe('USD');
  });

  test('is titled after the category and the month, with no account to edit', () => {
    const root = render({ category: 10, month: 8, type: 0, year: 2026 });

    expect(nodes(root, 'panel')[0].props.title).toBe(`${L10N.CATEGORIES[0][10]} · ${L10N.MONTHS[8]}`);
    expect(nodes(root, 'button')).toHaveLength(0);
  });

  test('adding from a category keeps its type and names no account, from the seal and from the empty state', () => {
    const root = render({ category: 3, month: 8, type: 1, year: 2026 });

    act(() => nodes(root, 'floating-add')[0].props.onPress());
    expect(navigate).toHaveBeenLastCalledWith('transaction', { type: 1 });

    act(() => nodes(root, 'empty')[0].props.onAction());
    expect(navigate).toHaveBeenLastCalledWith('transaction', { type: 1 });
  });

  // The store hands consolidated accounts, each carrying its own entries.
  test('an account keeps its own list and its Edit action', () => {
    const wallet = { ...ACCOUNTS[0], txs: mockStore.txs.filter((item) => item.account === 'a1') };
    mockStore = { ...mockStore, accounts: [wallet, ACCOUNTS[1]] };
    const root = render({ account: wallet });

    expect(nodes(root, 'item').map((node) => node.props.title).sort()).toEqual(['august', 'bread', 'coffee']);
    expect(nodes(root, 'button')).toHaveLength(1);
  });
});
