import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Transaction } from '../Transaction';

let mockStore = {};
let mockForm;

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../components', () => ({
  FormTransaction: (props) => {
    mockForm = props;
    return null;
  },
  FormTransfer: () => null,
}));

jest.mock('../helpers', () => ({ createTransaction: jest.fn(), createTransfer: jest.fn() }));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Button: stub('button'),
    Panel: ({ children }) => MockReact.createElement(ReactNative.View, null, children),
    SegmentedToggle: stub('segmented'),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const A1 = { currency: 'THB', hash: 'a1', title: 'Kasikorn' };
const A2 = { currency: 'EUR', hash: 'a2', title: 'N26' };
const tx = (account, category, timestamp) => ({ account, category, timestamp, title: 'x', type: 0, value: 10 });

let renderer;

const render = () => {
  act(() => {
    renderer = TestRenderer.create(<Transaction route={{ params: { account: A1 } }} navigation={{ goBack: () => {} }} />);
  });
};

describe('screens/Transaction default category', () => {
  beforeEach(() => {
    mockStore = {
      accounts: [A1, A2],
      txs: [tx('a1', 1, 1), tx('a1', 1, 2), tx('a1', 8, 3), tx('a2', 7, 4), tx('a2', 7, 5)],
    };
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
  });

  test('the form opens on the account\'s most frequent category', () => {
    render();

    expect(mockForm.form.category).toBe(1);
    expect(mockForm.categoryTouched).toBe(false);
  });

  test('what the concept filled in survives the account it moved to', () => {
    render();

    act(() => mockForm.onChange({ form: { title: 'Coffee', category: 10 }, valid: false }));
    act(() => mockForm.onAutoSelectAccount(A2));

    expect(mockForm.account.hash).toBe('a2');
    expect(mockForm.form.category).toBe(10);
  });

  test('choosing another account yourself starts the category over from its own habit', () => {
    render();

    act(() => mockForm.onChange({ form: { title: 'Coffee', category: 10 }, valid: false }));
    act(() => mockForm.onSelectAccount(A2));

    expect(mockForm.form.category).toBe(7);
  });
});
