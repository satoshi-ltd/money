import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Category } from '../Category';
import { L10N, percentText } from '../../../modules';

const navigate = jest.fn();
const goBack = jest.fn();

let mockStore;

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0', surface: '#5URFA0', text: '#TEXT00' } }),
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
    Panel: ({ children, footerElement }) =>
      MockReact.createElement(ReactNative.View, null, children, footerElement),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    PriceFriendly: stub('price'),
    Text: ({ align, figure, flex, medium, size, tone, uppercase, ...props }) =>
      MockReact.createElement(ReactNative.Text, props),
    View: ({ flex, row, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const tx = (hash, title, value, month, day, extra = {}) => ({
  account: 'a1',
  category: 4,
  hash,
  timestamp: new Date(2026, month, day).getTime(),
  title,
  type: 0,
  value,
  ...extra,
});

const PARAMS = { category: 4, color: '#CA7001', month: 7, monthTotal: 1000, type: 0, year: 2026 };

const render = (params = PARAMS) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Category navigation={{ goBack, navigate }} route={{ params }} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const allText = (root) => root.findAllByType(RNText).map((node) => collect(node.props.children));

beforeEach(() => {
  jest.clearAllMocks();
  mockStore = {
    accounts: [{ currency: 'EUR', hash: 'a1', title: 'N26' }],
    rates: {},
    settings: { baseCurrency: 'EUR' },
    txs: [
      tx('t0', 'Mercadona', 10, 3, 1),
      tx('t1', 'Mercadona', 300, 4, 1),
      tx('t2', 'Mercadona', 600, 5, 1),
      tx('t3', 'Mercadona', 450, 6, 1),
      tx('t4', 'Mercadona', 238.4, 7, 23),
      tx('t5', 'Lidl', 98.2, 7, 19),
      tx('t6', 'Lidl', 63.4, 7, 2),
    ],
  };
});

describe('screens/Category', () => {
  test('the hero is the month total with its share of spend', () => {
    const root = render();
    const hero = componentsBy(root, 'price').find((node) => node.props.size === 'xl');

    expect(hero.props.value).toBeCloseTo(400);
    expect(allText(root)).toContain(`${percentText(40)} ${L10N.OF_SPEND}`);
  });

  test('the delta compares the month against the three-month average, and spending less is the good news', () => {
    const average = (300 + 600 + 450) / 3;
    const expected = Math.round(((400 - average) / average) * 100);
    const delta = componentsBy(render(), 'delta')[0];

    expect(Math.round(delta.props.value)).toBe(expected);
    expect(delta.props.inverted).toBe(true);
  });

  test('merchants are grouped, ordered by amount and counted', () => {
    const root = render();
    const copy = allText(root);

    expect(copy.indexOf('Lidl')).toBeGreaterThan(copy.indexOf('Mercadona'));
    expect(copy).toContain('2 ×');
    expect(copy).toContain('1 ×');
    expect(componentsBy(root, 'heading')[0].props.eyebrow).toBe(`2 ${L10N.MERCHANTS}`);
  });

  test('the latest rows carry the account and a negative expense', () => {
    const root = render();
    const amounts = componentsBy(root, 'price').filter((node) => node.props.size === 'md');

    expect(allText(root)).toContain('N26');
    expect(amounts.some((node) => node.props.value === -238.4)).toBe(true);
  });

  test('see all opens the transactions screen', () => {
    const root = render();
    act(() => componentsBy(root, 'pressable')[0].props.onPress());

    expect(navigate).toHaveBeenCalledWith('transactions');
  });

  test('a ledger with no history omits the delta rather than inventing one', () => {
    mockStore = { ...mockStore, txs: [tx('t4', 'Mercadona', 238.4, 7, 23)] };

    expect(allText(render()).some((copy) => copy.includes('%') && copy.includes('−'))).toBe(false);
  });
});
