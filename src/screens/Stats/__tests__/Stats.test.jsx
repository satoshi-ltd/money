import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Stats } from '../Stats';
import { L10N } from '../../../modules';

let mockChartBalance = [];

jest.mock('@react-navigation/native', () => ({ useScrollToTop: () => {} }));

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => ({
    accounts: [{ currency: 'USD', hash: 'a1', title: 'Chase' }],
    overall: { chartBalance: mockChartBalance, currentBalance: 0 },
    rates: {},
    settings: { baseCurrency: 'USD', statsRangeMonths: 12 },
    txs: [],
    updateSettings: () => {},
  }),
}));

jest.mock('../modules', () => ({ ...jest.requireActual('../modules'), queryMonth: () => ({}) }));

jest.mock('../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return { ItemGroupCategories: stub('categories'), MonthKpis: stub('kpis') };
});

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Chart: stub('chart'),
    EmptyState: stub('empty'),
    FlowChart: stub('flow'),
    Masthead: ({ children }) => MockReact.createElement(ReactNative.View, { testID: 'masthead' }, children),
    Screen: MockReact.forwardRef(({ children }, ref) => MockReact.createElement(ReactNative.View, { ref, testID: 'screen' }, children)),
    SegmentedToggle: stub('segmented'),
    View: ({ row, flex, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

let renderer;
const navigate = jest.fn();
const render = () => {
  act(() => {
    renderer = TestRenderer.create(<Stats navigation={{ navigate }} />);
  });
  return renderer.root;
};
const nodes = (root, testID) => root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Stats', () => {
  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    navigate.mockClear();
  });

  // The default range is a year and queryChart pads its window to it: the bar is the history, never the window.
  test('under two months of history it shows what is missing and leads to the first entry', () => {
    mockChartBalance = [1200];
    const root = render();
    const [empty] = nodes(root, 'empty');

    expect(empty.props.title).toBe(L10N.EMPTY_ANALYTICS);
    expect(empty.props.caption).toBe(L10N.EMPTY_ANALYTICS_CAPTION);
    expect(empty.props.action).toBe(L10N.EMPTY_TRANSACTIONS_ACTION);
    expect(nodes(root, 'chart')).toHaveLength(0);
    expect(nodes(root, 'kpis')).toHaveLength(0);

    act(() => empty.props.onAction());
    expect(navigate).toHaveBeenCalledWith('transaction', { type: 0 });
  });

  test('with two months of history the charts take the screen and the empty state is gone', () => {
    mockChartBalance = [1200, 1350];
    const root = render();

    expect(nodes(root, 'empty')).toHaveLength(0);
    expect(nodes(root, 'chart')).toHaveLength(1);
    expect(nodes(root, 'flow')).toHaveLength(1);
    expect(nodes(root, 'kpis')).toHaveLength(1);
  });
});
