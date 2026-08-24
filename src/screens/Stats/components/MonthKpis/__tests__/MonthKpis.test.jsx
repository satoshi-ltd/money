import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { MonthKpis } from '../MonthKpis';
import { L10N } from '../../../../../modules';
import { theme } from '../../../../../theme';

const BORDER = '#B0RDE0';

jest.mock('../../../../../contexts', () => ({ useApp: () => ({ colors: { border: '#B0RDE0' } }) }));

jest.mock('../../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Heading: (props) => MockReact.createElement(ReactNative.View, { testID: 'heading', ...props }),
    PriceFriendly: (props) => MockReact.createElement(ReactNative.View, { testID: 'price', ...props }),
    Text: ({ size, tone, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<MonthKpis currency="EUR" expenses={1318} incomes={2450} title="August" {...props} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Stats/MonthKpis', () => {
  test('in is signed positive, out negative, and net is their difference', () => {
    const [income, expense, net] = componentsBy(render(), 'price');

    expect(income.props).toMatchObject({ operator: true, value: 2450 });
    expect(expense.props.value).toBe(-1318);
    expect(expense.props.operator).toBeUndefined();
    expect(net.props).toMatchObject({ operator: true, value: 1132 });
  });

  test('a month that spent more than it earned reports a negative net', () => {
    const net = componentsBy(render({ expenses: 3000, incomes: 1000 }), 'price')[2];

    expect(net.props.value).toBe(-2000);
  });

  test('the month is the heading and the eyebrow says what window it covers', () => {
    const [heading] = componentsBy(render(), 'heading');

    expect(heading.props.value).toBe('August');
    expect(heading.props.eyebrow).toBe(L10N.MONTH_TO_DATE);
  });

  test('the columns are split by hairlines, not boxed', () => {
    const dividers = render()
      .findAllByType('View')
      .map((node) => StyleSheet.flatten(node.props.style))
      .filter((flat) => flat?.borderLeftWidth === theme.hairline);

    expect(dividers).toHaveLength(2);
    expect(dividers.every(({ borderLeftColor }) => borderLeftColor === BORDER)).toBe(true);
  });
});
