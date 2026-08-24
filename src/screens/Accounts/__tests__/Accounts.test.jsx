import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Accounts } from '../Accounts';
import { theme } from '../../../theme';
import { L10N, percentText } from '../../../modules';

const ACCENT = '#ACCE07';
const BORDER = '#B0RDE0';
const RULE = '#RULE00';

let mockStore = {};

jest.mock('@react-navigation/native', () => ({ useScrollToTop: () => {} }));

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: {
      accent: '#ACCE07',
      border: '#B0RDE0',
      rule: '#RULE00',
      text: '#TEXT00',
      textMuted: '#MUTED0',
      textSecondary: '#SECON0',
    },
  }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    SegmentedToggle: (props) => MockReact.createElement(ReactNative.View, { testID: 'segmented', ...props }),
    EmptyState: stub('empty'),
    IconButton: (props) => MockReact.createElement(ReactNative.View, { testID: 'iconbutton', ...props }),
    Delta: stub('delta'),
    Heading: stub('heading'),
    Masthead: stub('masthead'),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    PriceFriendly: stub('price'),
    Screen: MockReact.forwardRef((props, ref) => {
      MockReact.useImperativeHandle(ref, () => ({}));
      return MockReact.createElement(ReactNative.View, props);
    }),
    Text: ({ figure, size, tone, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ row, flex, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const account = (hash, title, currency, currentBalance, currentBalanceBase = currentBalance) => ({
  hash,
  title,
  currency,
  currentBalance,
  currentBalanceBase,
  currentMonth: { progressionCurrency: 0 },
  chartBalanceBase: [],
  txs: [],
});

const navigate = jest.fn();

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Accounts navigation={{ navigate }} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

const flats = (root) =>
  root
    .findAllByType('View')
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

describe('screens/Accounts', () => {
  beforeEach(() => {
    navigate.mockClear();
    mockStore = {
      accounts: [
        account('a1', 'N26', 'EUR', 6000),
        account('a2', 'Revolut', 'USD', 2000, 1800),
        account('a3', 'Nubank', 'BRL', 1000, 1200),
        account('a4', 'Wise', 'GBP', 500, 1000),
      ],
      overall: { currentBalance: 10000 },
      settings: { baseCurrency: 'EUR' },
    };
  });

  test('the section is announced by the masthead, not a big title', () => {
    const root = render();

    expect(componentsBy(root, 'masthead')).toHaveLength(1);
    expect(componentsBy(root, 'masthead')[0].props.section).toBe(L10N.ACCOUNTS);
  });

  test('the masthead is fixed chrome, outside the scrolling screen', () => {
    const root = render();
    const [masthead] = componentsBy(root, 'masthead');
    const screen = root.findAll((node) => node.type?.displayName === 'Screen' || node.props?.testID === 'screen');

    let ancestor = masthead.parent;
    while (ancestor && !screen.includes(ancestor)) ancestor = ancestor.parent;

    expect(ancestor).toBeNull();
  });

  test('the net worth is the hero figure, in the mono ramp', () => {
    const hero = componentsBy(render(), 'price').find((node) => node.props.size === 'hero');

    expect(hero.props.value).toBe(10000);
    expect(hero.props.bold).toBe(true);
    expect(hero.props.currency).toBe('EUR');
  });

  test('the distribution bar is ordered by amount, whichever currency is the base one', () => {
    mockStore = {
      ...mockStore,
      accounts: [
        account('a1', 'Kraken', 'USD', 500, 500),
        account('a2', 'Blackledger', 'BTC', 4, 5000),
        account('a3', 'N26', 'EUR', 1000, 1000),
      ],
      settings: { baseCurrency: 'USD' },
    };
    const bar = flats(render()).filter((flat) => flat.flexGrow !== undefined);

    expect(bar.map(({ flexGrow }) => flexGrow)).toEqual([77, 15, 8]);
    expect(bar.map(({ backgroundColor }) => backgroundColor)).toEqual([ACCENT, '#TEXT00', '#SECON0']);
  });

  test('the base currency is marked by weight, not by a colour of its own', () => {
    const root = render();
    const codes = root.findAllByType(RNText).filter((node) => node.props.children === 'EUR');

    expect(codes.some((node) => node.props.medium === true)).toBe(true);
    expect(codes.some((node) => node.props.medium === undefined)).toBe(true);
  });

  test('the legend shows the share, not a second copy of the amounts', () => {
    const root = render();
    // Converted row amounts are also size xs; the legend would be the ones without a currency mark.
    const legend = componentsBy(root, 'price').filter((node) => node.props.size === 'xs' && !node.props.showSymbol);

    expect(legend).toHaveLength(0);
    expect(root.findAllByType(RNText).map((node) => node.props.children)).toContain(percentText(60));
  });

  test('the bar ranks in one ink: accent leads, the rest step down, the tail is muted', () => {
    const bar = flats(render()).filter((flat) => flat.flexGrow !== undefined);
    const colours = bar.map(({ backgroundColor }) => backgroundColor);

    expect(colours).toEqual([ACCENT, '#TEXT00', '#SECON0', '#MUTED0']);
    expect(new Set(colours).size).toBe(colours.length);
    expect(bar.every(({ borderRadius }) => borderRadius === undefined || borderRadius === 0)).toBe(true);
  });

  test('the distribution bar is hidden when every account shares one currency', () => {
    mockStore = { ...mockStore, accounts: [account('a1', 'N26', 'EUR', 6000)] };

    expect(flats(render()).filter((flat) => flat.flexGrow !== undefined)).toHaveLength(0);
  });

  test('account rows are hairline-separated, with no card wrapper', () => {
    const rows = flats(render()).filter((flat) => flat.borderBottomWidth === theme.hairline);

    expect(rows).toHaveLength(4);
    expect(rows.every(({ borderBottomColor }) => borderBottomColor === BORDER)).toBe(true);
    expect(rows.every(({ borderRadius }) => borderRadius === undefined)).toBe(true);
  });

  // The second line does one job: what the balance is worth in the base currency.
  test('a foreign account shows its conversion, and nothing else competes on that line', () => {
    mockStore = {
      ...mockStore,
      accounts: [{ ...account('a2', 'Revolut', 'USD', 2000, 1800), currentMonth: { progressionCurrency: 200 } }],
    };
    const root = render();

    expect(componentsBy(root, 'price').some((node) => node.props.showSymbol === true)).toBe(true);
    expect(componentsBy(root, 'delta')).toHaveLength(0);
  });

  test('the hero eyebrow names the base currency, like the dashboard does', () => {
    const eyebrow = render()
      .findAllByType(RNText)
      .map((node) => node.props.children)
      .find((copy) => typeof copy === 'string' && copy.includes(L10N.NET_WORTH));

    expect(eyebrow).toContain('EUR');
  });

  test('a foreign-currency account shows its converted base amount', () => {
    const converted = componentsBy(render(), 'price').filter((node) => node.props.showSymbol === true);

    expect(converted).toHaveLength(3);
    expect(converted.every((node) => node.props.currency === 'EUR')).toBe(true);
  });

  test('a total row closes the list under a strong rule', () => {
    const root = render();
    const rule = flats(root).find((flat) => flat.borderTopWidth === theme.hairline);
    const totals = componentsBy(root, 'price').filter((node) => node.props.size === 'lg');

    expect(rule.borderTopColor).toBe(RULE);
    expect(totals[totals.length - 1].props.value).toBe(6000 + 1800 + 1200 + 1000);
  });

  test('picking a currency filters the rows and retotals them in that currency', () => {
    const root = render();
    const [toggle] = componentsBy(root, 'segmented');
    act(() => toggle.props.onChange('USD'));

    const balances = componentsBy(root, 'price').filter((node) => node.props.size === 'lg');

    expect(balances).toHaveLength(2);
    expect(balances[0].props.value).toBe(2000);
    expect(balances[1].props.value).toBe(2000);
    expect(balances[1].props.currency).toBe('USD');
  });

  test('an empty ledger shows the empty state instead of a zero net worth', () => {
    mockStore = { ...mockStore, accounts: [], overall: { currentBalance: 0 } };
    const root = render();
    const [empty] = componentsBy(root, 'empty');

    expect(empty).toBeDefined();
    expect(empty.props.title).toBe(L10N.EMPTY_ACCOUNTS);
    expect(componentsBy(root, 'price')).toHaveLength(0);

    act(() => empty.props.onAction());
    expect(navigate).toHaveBeenCalledWith('account', { create: true });
  });

  test('the add action opens the account form and a row opens its transactions', () => {
    const root = render();
    const [add] = componentsBy(root, 'iconbutton');
    act(() => add.props.onPress());

    expect(navigate).toHaveBeenCalledWith('account', { create: true });

    act(() => componentsBy(root, 'pressable')[0].props.onPress());

    expect(navigate).toHaveBeenLastCalledWith('transactions', { account: expect.objectContaining({ hash: 'a1' }) });
  });
});
