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

jest.mock('../helpers', () => ({
  createTransaction: jest.fn(),
  createTransfer: jest.fn(),
  isTransactionComplete: jest.requireActual('../helpers/isTransactionComplete').isTransactionComplete,
}));

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
      txs: [
        tx('a1', 1, 1),
        tx('a1', 1, 2),
        tx('a1', 8, 3),
        tx('a2', 7, 4),
        tx('a2', 7, 5),
        { ...tx('a1', 3, 6), type: 1 },
      ],
    };
  });

  const saveButton = () =>
    renderer.root.findAllByProps({ testID: 'button' }).find((node) => typeof node.type === 'function');

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

  describe('the save button', () => {
    const filled = { form: { category: 10, title: 'Coffee', value: '40' }, valid: true };

    test('is disabled while a field is missing, and only then', () => {
      render();
      expect(saveButton().props.disabled).toBe(true);

      act(() => mockForm.onChange({ form: { category: 10, title: '', value: '40' }, valid: false }));
      expect(saveButton().props.disabled).toBe(true);

      act(() => mockForm.onChange(filled));
      expect(saveButton().props.disabled).toBe(false);
    });

    // The default category came back after the switch, but the stored flag stayed false until the next keystroke.
    test('stays available after you change the account, once the default category is back', () => {
      render();
      act(() => mockForm.onChange(filled));
      act(() => mockForm.onSelectAccount(A2));

      expect(mockForm.form.category).toBe(7);
      expect(saveButton().props.disabled).toBe(false);
    });

    test('stays available after you switch the type, once that type has a default category', () => {
      render();
      act(() => mockForm.onChange(filled));
      act(() => mockForm.onTypeChange(1));

      expect(mockForm.form.category).toBe(3);
      expect(saveButton().props.disabled).toBe(false);
    });
  });

  test('choosing another account yourself starts the category over from its own habit', () => {
    render();

    act(() => mockForm.onChange({ form: { title: 'Coffee', category: 10 }, valid: false }));
    act(() => mockForm.onSelectAccount(A2));

    expect(mockForm.form.category).toBe(7);
  });
});
