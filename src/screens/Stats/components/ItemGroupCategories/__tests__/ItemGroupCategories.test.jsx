import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ItemGroupCategories } from '../ItemGroupCategories';
import { L10N, percentText } from '../../../../../modules';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));

let mockMask = false;

jest.mock('../../../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', text: '#TEXT00', textMuted: '#MUTED0', textSecondary: '#SECON0' },
    language: 'en',
  }),
  useAmountSettings: () => ({ baseCurrency: 'EUR', maskAmount: mockMask }),
}));

jest.mock('../../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Chip: (props) => MockReact.createElement(ReactNative.View, { testID: 'chip', ...props }),
    Heading: (props) => MockReact.createElement(ReactNative.View, { testID: 'heading', ...props }),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

jest.mock('../HorizontalChartItem', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { HorizontalChartItem: (props) => MockReact.createElement(ReactNative.View, { testID: 'bar', ...props }) };
});

const DATA_SOURCE = {
  4: { mercadona: 300, lidl: 100 },
  5: { 'casa paco': 200 },
  6: { renfe: 50 },
  7: { gym: 25 },
  8: { vet: 25 },
};

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <ItemGroupCategories dataSource={DATA_SOURCE} month={7} type={0} year={2026} {...props} />,
    );
  });
  return renderer.root;
};

const heading = (root) => root.findAllByProps({ testID: 'heading' })[0].props;

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

beforeEach(() => {
  mockNavigate.mockClear();
  mockMask = false;
});

describe('screens/Stats/ItemGroupCategories', () => {
  test('the same block reads the month either way, expenses or incomes', () => {
    expect(heading(render()).value).toBe(L10N.EXPENSES);
    expect(heading(render({ type: 1 })).value).toBe(L10N.INCOMES);
  });

  // It was a chip with a chevron and no onPress: a control that invited a tap and did nothing, for a month
  // the chart above already commands.
  test('the month is written, not offered as a control that goes nowhere', () => {
    const root = render({ monthLabel: 'August 2026' });

    expect(heading(root).eyebrow).toBe('August 2026');
    expect(root.findAllByProps({ testID: 'chip' })).toHaveLength(0);
  });

  test('tapping a category opens the sheet instead of expanding in place', () => {
    const root = render();
    act(() => componentsBy(root, 'pressable')[0].props.onPress());

    expect(mockNavigate).toHaveBeenCalledWith(
      'category',
      expect.objectContaining({ category: 4, color: '#ACCE07', month: 7, monthTotal: 700, type: 0, year: 2026 }),
    );
  });

  describe('with a budget', () => {
    const SEPTEMBER = 2026 * 12 + 7;
    const budgets = { 4: { limit: 300, since: SEPTEMBER - 2 }, 5: { limit: 150, since: SEPTEMBER - 2 }, 6: { limit: 500, since: SEPTEMBER } };
    const bars = (props) => componentsBy(render({ budgets, ...props }), 'bar');

    test('a budgeted category reads against its limit, the rest as a share as before', () => {
      const [food, eating, transit, gym] = bars();

      expect(food.props.budget).toMatchObject({ over: 100, state: 'over' });
      expect(eating.props.budget).toMatchObject({ over: 50, state: 'over' });
      expect(transit.props.budget).toMatchObject({ state: 'within', total: 500 });
      expect(gym.props.budget).toBeUndefined();
    });

    test('what was left of last month is carried in, and a month with no previous month carries nothing', () => {
      const withPrevious = bars({ previous: { 4: { mercadona: 100 }, 5: { 'casa paco': 150 } } });
      const withoutPrevious = bars();

      expect(withPrevious[0].props.budget).toMatchObject({ carried: 200, state: 'within', total: 500 });
      expect(withPrevious[1].props.budget).toMatchObject({ carried: 0, state: 'over', total: 150 });
      expect(withoutPrevious[0].props.budget.carried).toBe(0);
    });

    test('a screen reader hears each row as its category, its share and its amount, and that a budget is passed only when it is', () => {
      const labels = componentsBy(render({ budgets }), 'pressable').map(({ props }) => props.accessibilityLabel);

      expect(labels[0]).toBe(`${L10N.CATEGORIES[0][4]}, ${percentText(57)}, €400, ${L10N.BUDGET_PASSED}`);
      expect(labels[1]).toBe(`${L10N.CATEGORIES[0][5]}, ${percentText(28)}, €200, ${L10N.BUDGET_PASSED}`);
      expect(labels[2]).toBe(`${L10N.CATEGORIES[0][6]}, ${percentText(7)}, €50`);
      expect(labels[2]).not.toContain(L10N.BUDGET_PASSED);
      expect(componentsBy(render({ budgets }), 'pressable')[0].props.accessibilityRole).toBe('button');
    });

    test('with the amounts masked a screen reader is not told what the screen hides', () => {
      mockMask = true;
      const labels = componentsBy(render({ budgets }), 'pressable').map(({ props }) => props.accessibilityLabel);

      expect(labels[0]).toBe(`${L10N.CATEGORIES[0][4]}, ${percentText(57)}, ${L10N.BUDGET_PASSED}`);
      expect(labels[2]).toBe(`${L10N.CATEGORIES[0][6]}, ${percentText(7)}`);
      expect(labels.join(' ')).not.toMatch(/€/);
    });

    test('incomes never carry a budget', () => {
      expect(componentsBy(render({ budgets, type: 1 }), 'bar').every(({ props }) => props.budget === undefined)).toBe(true);
    });
  });

  test('the leader is the only coloured row: accent first, ink after', () => {
    const bars = componentsBy(render(), 'bar');

    expect(bars.map(({ props }) => props.color)).toEqual(['#ACCE07', '#TEXT00', '#SECON0', '#MUTED0']);
  });

  test('the folded row reads as a button with its count, share and amount, and Show less as one too', () => {
    const root = render();
    const [, , , others] = componentsBy(root, 'pressable');

    expect(others.props.accessibilityRole).toBe('button');
    expect(others.props.accessibilityLabel).toBe(`${L10N.OTHERS} · 2, ${percentText(7)}, €50`);

    act(() => others.props.onPress());
    const fold = componentsBy(root, 'pressable').find(({ props }) => props.accessibilityLabel === L10N.SHOW_LESS);

    expect(fold.props.accessibilityRole).toBe('button');
  });

  test('only the top three categories are listed, with the tail folded into one row', () => {
    const bars = componentsBy(render(), 'bar');

    expect(bars).toHaveLength(4);
    expect(bars[3].props.value).toBe(50);
    expect(bars[3].props.title).toContain('2');
  });

  // A fifth of the spend used to sit behind a row that looked tappable and was not.
  test('the folded tail opens in place, and folds back', () => {
    const root = render();
    const tail = componentsBy(root, 'pressable').slice(-1)[0];
    const before = componentsBy(root, 'pressable').length;

    act(() => tail.props.onPress());
    expect(componentsBy(root, 'pressable').length).toBeGreaterThan(before);

    act(() => componentsBy(root, 'pressable').slice(-1)[0].props.onPress());
    expect(componentsBy(root, 'pressable')).toHaveLength(before);
  });
});
