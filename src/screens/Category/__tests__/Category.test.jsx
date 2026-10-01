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
    InputAmount: stub('budget-input'),
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

describe('screens/Category budget', () => {
  const SINCE = 2026 * 12 + 5;
  const withBudget = (limit, params) => {
    mockStore = { ...mockStore, settings: { baseCurrency: 'EUR', budgets: { 4: { limit, since: SINCE } } }, updateSettings: jest.fn() };
    return render(params);
  };

  test('the field holds the limit, and leaving it saves what was typed under the month it began', () => {
    const root = withBudget(500);
    const input = componentsBy(root, 'budget-input')[0];

    expect(input.props.value).toBe('500');
    act(() => input.props.onChange('600'));
    act(() => componentsBy(root, 'budget-input')[0].props.onBlur());

    expect(mockStore.updateSettings).toHaveBeenCalledWith({ budgets: { 4: { limit: 600, since: SINCE } } });
  });

  test('clearing the field removes the budget', () => {
    const root = withBudget(500);
    act(() => componentsBy(root, 'budget-input')[0].props.onChange(undefined));
    act(() => componentsBy(root, 'budget-input')[0].props.onBlur());

    expect(mockStore.updateSettings).toHaveBeenCalledWith({ budgets: {} });
  });

  test('with no limit there is only the empty field, and typing one starts it this month', () => {
    mockStore = { ...mockStore, updateSettings: jest.fn() };
    const root = render();

    expect(componentsBy(root, 'budget-input')[0].props.value).toBe('');
    expect(allText(root)).not.toContain(L10N.BUDGET_LEFT);
    act(() => componentsBy(root, 'budget-input')[0].props.onChange('250'));
    act(() => componentsBy(root, 'budget-input')[0].props.onBlur());

    expect(mockStore.updateSettings).toHaveBeenCalledWith({ budgets: { 4: { limit: 250, since: expect.any(Number) } } });
  });

  test('says what was carried in from last month and what is left of the total', () => {
    const root = withBudget(500);
    const values = componentsBy(root, 'price').map((node) => node.props.value);

    expect(allText(root)).toEqual(expect.arrayContaining([L10N.BUDGET_CARRIED, L10N.BUDGET_LEFT, L10N.BUDGET_OF('550')]));
    expect(values).toEqual(expect.arrayContaining([50, 150]));
  });

  test('past the total what is left is negative and in the danger tone', () => {
    const left = componentsBy(withBudget(300), 'price').find((node) => node.props.tone === 'danger');

    expect(left.props.value).toBeCloseTo(-100);
  });

  test('an entry hidden from Analytics is not spent against the budget, as in the month block and the bar', () => {
    mockStore = { ...mockStore, txs: [...mockStore.txs, tx('t7', 'Cash', 77, 7, 5, { meta: { moved: true } })] };
    const values = componentsBy(withBudget(500), 'price').map((node) => node.props.value);

    expect(values).toContain(150);
    expect(values).not.toContain(73);
  });

  test('leaving the sheet with the field focused still saves what was typed, once', () => {
    let renderer;
    mockStore = { ...mockStore, settings: { baseCurrency: 'EUR', budgets: { 4: { limit: 500, since: SINCE } } }, updateSettings: jest.fn() };
    act(() => {
      renderer = TestRenderer.create(<Category navigation={{ goBack, navigate }} route={{ params: PARAMS }} />);
    });
    act(() => componentsBy(renderer.root, 'budget-input')[0].props.onChange('700'));
    act(() => renderer.unmount());

    expect(mockStore.updateSettings).toHaveBeenCalledTimes(1);
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ budgets: { 4: { limit: 700, since: SINCE } } });
  });

  test('a focus that changes nothing writes nothing, and a zero empties the field it removed', () => {
    const root = withBudget(500);
    act(() => componentsBy(root, 'budget-input')[0].props.onBlur());
    expect(mockStore.updateSettings).not.toHaveBeenCalled();

    act(() => componentsBy(root, 'budget-input')[0].props.onChange('0'));
    act(() => componentsBy(root, 'budget-input')[0].props.onBlur());
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ budgets: {} });
    expect(componentsBy(root, 'budget-input')[0].props.value).toBe('');
  });

  test('the field is named for a screen reader', () => {
    expect(componentsBy(withBudget(500), 'budget-input')[0].props.accessibilityLabel).toBe(L10N.BUDGET);
  });

  test('an income category has no budget to set', () => {
    expect(componentsBy(withBudget(500, { ...PARAMS, type: 1 }), 'budget-input')).toHaveLength(0);
  });
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

  test('see all opens the transactions screen filtered to this category and month', () => {
    const root = render();
    act(() => componentsBy(root, 'pressable')[0].props.onPress());

    expect(navigate).toHaveBeenCalledWith('transactions', { category: 4, month: 7, type: 0, year: 2026 });
  });

  test('see all counts what the transactions screen will list, even entries the sheet cannot price', () => {
    mockStore = {
      ...mockStore,
      accounts: [...mockStore.accounts, { currency: 'ARS', hash: 'a2', title: 'Galicia' }],
      txs: [...mockStore.txs, tx('t7', 'Kiosco', 500, 7, 5, { account: 'a2' }), tx('t8', 'Free', 0, 7, 6)],
    };
    const root = render();
    const eyebrow = componentsBy(root, 'eyebrow').find((node) => node.props.children === L10N.SEE_ALL_COUNT(5));

    expect(eyebrow).toBeDefined();
  });

  test('a ledger with no history omits the delta rather than inventing one', () => {
    mockStore = { ...mockStore, txs: [tx('t4', 'Mercadona', 238.4, 7, 23)] };

    expect(allText(render()).some((copy) => copy.includes('%') && copy.includes('−'))).toBe(false);
  });
});
