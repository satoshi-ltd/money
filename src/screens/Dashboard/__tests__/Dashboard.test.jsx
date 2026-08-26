import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Dashboard } from '../Dashboard';

const mockScrollTo = jest.fn();
let mockStore = {};

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  const MockReact = require('react');

  return {
    Platform: ReactNative.Platform,
    StyleSheet: ReactNative.StyleSheet,
    View: ReactNative.View,
    SectionList: MockReact.forwardRef(({ onContentSizeChange, sections }, ref) => {
      MockReact.useImperativeHandle(ref, () => ({
        getScrollResponder: () => ({ scrollTo: mockScrollTo }),
      }));

      return MockReact.createElement(ReactNative.View, {
        testID: 'section-list',
        onContentSizeChange,
        sections,
      });
    }),
  };
});

jest.mock('@react-navigation/native', () => ({ useScrollToTop: () => {} }));

jest.mock('../../../contexts', () => ({
  useStore: () => mockStore,
}));

jest.mock('../Dashboard.ListHeader', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');

  return {
    DashboardListHeader: () => MockReact.createElement(ReactNative.View),
  };
});

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = () => MockReact.createElement(ReactNative.View);

  return {
    Masthead: stub,
    Screen: ({ children }) => MockReact.createElement(ReactNative.View, null, children),
    TransactionItem: stub,
    TransactionsHeader: stub,
  };
});

describe('screens/Dashboard', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    mockStore = {
      accounts: [{ hash: 'account', currency: 'EUR' }],
      session: { locale: 'en' },
      today: new Date(2026, 7, 26),
      txs: [
        {
          account: 'account',
          hash: 'tx',
          timestamp: new Date(2026, 7, 26).getTime(),
          value: 10,
        },
      ],
    };
  });

  test('starts with transactions loaded and resets the initial offset once', () => {
    let renderer;
    act(() => {
      renderer = TestRenderer.create(<Dashboard navigation={{ navigate: jest.fn() }} />);
    });

    const list = renderer.root.findByProps({ testID: 'section-list' });
    expect(list.props.sections).toHaveLength(1);

    act(() => list.props.onContentSizeChange());
    expect(mockScrollTo).toHaveBeenCalledWith({ y: 0, animated: false });

    act(() => list.props.onContentSizeChange());
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
  });
});
