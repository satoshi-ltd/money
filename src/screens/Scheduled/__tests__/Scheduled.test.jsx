import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Scheduled } from '../Scheduled';

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {}, language: 'en' }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Button: (props) => MockReact.createElement(ReactNative.View, { testID: 'button', ...props }),
    Panel: ({ children, rightElement, ...props }) =>
      MockReact.createElement(ReactNative.View, { testID: 'panel', ...props }, rightElement, children),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    PriceFriendly: (props) => MockReact.createElement(ReactNative.View, { testID: 'price', ...props }),
    ScrollView: (props) => MockReact.createElement(ReactNative.View, props),
    Text: ({ figure, medium, size, tone, uppercase, ...props }) =>
      MockReact.createElement(ReactNative.Text, { ...props, figure, size, tone, uppercase }),
    View: ({ row, flex, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const NOW = new Date(2026, 7, 23, 9, 0, 0);
const START = new Date(2026, 0, 1, 9, 0, 0).getTime();

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Scheduled navigation={{ goBack: () => {}, navigate: () => {} }} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Scheduled', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    mockStore = {
      accounts: [{ hash: 'a1', title: 'N26', currency: 'EUR' }],
      rates: {},
      scheduledTxs: [
        {
          id: 'gym',
          account: 'a1',
          type: 0,
          value: 40,
          title: 'Gym',
          startAt: START,
          pattern: { kind: 'weekly', interval: 1, byWeekday: [1] },
        },
        {
          id: 'salary',
          account: 'a1',
          type: 1,
          value: 3200,
          title: 'Salary',
          startAt: START,
          pattern: { kind: 'monthly', interval: 1, byMonthDay: 25 },
        },
        {
          id: 'rent',
          account: 'a1',
          type: 0,
          value: 1200,
          title: 'Rent',
          startAt: START,
          pattern: { kind: 'monthly', interval: 1, byMonthDay: 1 },
        },
      ],
      settings: { baseCurrency: 'EUR' },
    };
  });

  afterEach(() => jest.useRealTimers());

  test('the monthly impact is the summary figure, signed and on the figure ramp', () => {
    const summary = componentsBy(render(), 'price').filter((node) => node.props.size === 'xl');

    expect(summary).toHaveLength(1);
    expect(summary[0].props).toMatchObject({ bold: true, operator: true, value: 1800 });
  });

  test('rows carry a signed amount: income positive, expense negative', () => {
    const amounts = componentsBy(render(), 'price').filter((node) => node.props.size === 'md');

    expect(amounts.map((node) => node.props.value)).toEqual([-40, 3200, -1200]);
    amounts.forEach((node) => expect(node.props).toMatchObject({ bold: true, operator: true }));
  });

  test('the header counts the active schedules', () => {
    const panel = componentsBy(render(), 'panel')[0];

    expect(panel.props.subtitle).toBe('3 active');
  });

  test('the next occurrence is a weekday over a date figure', () => {
    const root = render();

    const weekdays = root.findAllByProps({ testID: 'eyebrow' }).filter((node) => typeof node.type === 'string');
    const dates = root.findAllByType('Text').filter((node) => node.props.figure === 'xs');

    expect(weekdays.map((node) => node.props.children)).toEqual(
      expect.arrayContaining(['Mon', 'Tue']),
    );
    expect(dates).toHaveLength(3);
  });

  test('an empty ledger renders no rows', () => {
    mockStore = { ...mockStore, scheduledTxs: [] };

    expect(componentsBy(render(), 'price').filter((node) => node.props.size === 'md')).toHaveLength(0);
  });

  test('each row carries its own account currency, and the marking is decided by PriceFriendly', () => {
    mockStore = {
      ...mockStore,
      accounts: [
        { currency: 'EUR', hash: 'a1', title: 'N26' },
        { currency: 'USD', hash: 'a2', title: 'Kraken' },
      ],
      rates: { '2026-08': { USD: 1.1 } },
      scheduledTxs: [
        { account: 'a1', id: 'rent', pattern: { byMonthDay: 28, interval: 1, kind: 'monthly' }, startAt: START, title: 'Rent', type: 0, value: 1200 },
        { account: 'a2', id: 'aws', pattern: { byMonthDay: 28, interval: 1, kind: 'monthly' }, startAt: START, title: 'AWS', type: 0, value: 90 },
      ],
      settings: { baseCurrency: 'EUR' },
    };

    const rows = componentsBy(render(), 'price').filter(({ props }) => props.size === 'md');
    const [base, foreign] = [rows.find((r) => r.props.currency === 'EUR'), rows.find((r) => r.props.currency === 'USD')];

    expect(foreign.props.currency).toBe('USD');
    expect(base.props.currency).toBe('EUR');
  });

  test('the impact eyebrow names the currency the whole screen is denominated in', () => {
    const eyebrow = render()
      .findAllByType('Text')
      .map((node) => node.props.children)
      .find((copy) => typeof copy === 'string' && copy.includes('·'));

    expect(eyebrow).toContain(mockStore.settings.baseCurrency);
  });
});
