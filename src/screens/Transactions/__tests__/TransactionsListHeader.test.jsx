import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { TransactionsListHeader } from '../Transactions.ListHeader';
import { accountBalanceEyebrow, C, ICON, L10N } from '../../../modules';
import { theme } from '../../../theme';

const COLORS = { accent: '#accent', accentSoft: '#accentSoft', border: '#border', surface: '#surface', text: '#text' };

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#accent', accentSoft: '#accentSoft', border: '#border', surface: '#surface', text: '#text' },
  }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Delta: stub('delta'),
    Icon: stub('icon'),
    Input: stub('input'),
    PriceFriendly: stub('price'),
    Text: ({ figure, medium, size, tone, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ row, flex, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});


const TODAY = new Date(2026, 7, 23).getTime();

const tx = (type, value) => ({ type, value, timestamp: TODAY });

const DATA_SOURCE = {
  hash: 'a1',
  currency: 'EUR',
  currentBalance: 1100,
  currentMonth: { progressionCurrency: 100 },
  txs: [tx(C.TX.TYPE.INCOME, 2000), tx(C.TX.TYPE.EXPENSE, 500)],
};

let renderer;

const render = (dataSource = DATA_SOURCE, props = {}) => {
  act(() => {
    renderer = TestRenderer.create(
      <TransactionsListHeader
        dataSource={dataSource}
        onSearch={() => {}}
        setPage={() => {}}
        {...props}
      />,
    );
  });
  return renderer.root;
};

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
});

const nodesBy = (root, testID) => root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

const flatStyles = (root) =>
  root
    .findAll((node) => typeof node.type === 'string' && node.props?.style !== undefined)
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

describe('screens/Transactions/ListHeader', () => {
  beforeEach(() => {
    mockStore = { accounts: [{ hash: 'a1' }, { hash: 'a2' }], settings: { baseCurrency: 'EUR' }, today: TODAY };
  });

  test('the balance is the hero figure, with the month delta beside it', () => {
    const root = render();

    const hero = nodesBy(root, 'price').find((node) => node.props.size === 'hero');
    expect(hero.props.value).toBe(1100);
    expect(hero.props.bold).toBe(true);

    const delta = nodesBy(root, 'delta');
    expect(delta).toHaveLength(1);
    expect(delta[0].props.value).toBeCloseTo(10);
  });

  test('a flat month reports nothing rather than a zero', () => {
    const root = render({ ...DATA_SOURCE, currentMonth: { progressionCurrency: 0 } });

    expect(nodesBy(root, 'delta')[0].props.value).toBeFalsy();
  });

  test('the month flow sits under a hairline and both bars are square', () => {
    const root = render();

    const flat = flatStyles(root);
    expect(flat.filter((item) => item.borderTopWidth === theme.hairline)).toHaveLength(1);

    const bars = flat.filter((item) => item.height === 5);
    expect(bars).toHaveLength(2);
    expect(bars.every((item) => item.backgroundColor === COLORS.surface && item.borderRadius === undefined)).toBe(true);

    const fills = flat.filter((item) => item.height === '100%');
    expect(fills.map((item) => item.backgroundColor)).toEqual([COLORS.accent, COLORS.text]);
    expect(fills.every((item) => item.borderRadius === undefined)).toBe(true);
  });

  test('the flow amounts are signed figures, income positive and expense negative', () => {
    const amounts = nodesBy(render(), 'price').filter((node) => node.props.size === 'md');

    expect(amounts.map((node) => node.props.value)).toEqual([2000, -500]);
    expect(amounts[0].props.operator).toBe(true);
  });


  test('there is no search box here: searching lives on the dashboard, this space does not', () => {
    const root = render();

    expect(root.findAllByProps({ name: ICON.SEARCH })).toHaveLength(0);
    expect(root.findAll((node) => node.props?.placeholder !== undefined)).toHaveLength(0);
  });

  test('drops the balance and flow blocks when the account is unknown', () => {
    const root = render({});

    expect(nodesBy(root, 'price')).toHaveLength(0);
  });

  // The sheet asks for the type the moment it opens, so the header does not ask first.
  test('no type shortcuts here: one way in, and it chooses inside', () => {
    const texts = render()
      .findAll((node) => typeof node.props?.children === 'string')
      .map((node) => node.props.children);

    expect(texts).not.toContain(L10N.INCOME);
    expect(texts).not.toContain(L10N.EXPENSE);
    expect(texts).not.toContain(L10N.SWAP);
  });

  test('the figure says what it is and what it is counted in', () => {
    const texts = render()
      .findAll((node) => typeof node.props?.children === 'string')
      .map((node) => node.props.children);

    expect(texts).toContain(accountBalanceEyebrow('EUR'));
  });
});
