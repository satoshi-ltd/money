import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Clone } from '../Clone';
import { L10N } from '../../../modules';

let mockStore = {};
let mockForm;

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../../Transaction/components', () => ({
  FormTransaction: (props) => {
    mockForm = props;
    return null;
  },
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Button: ({ children, ...props }) => MockReact.createElement(ReactNative.View, { testID: 'button', ...props }, children),
    Panel: ({ children }) => MockReact.createElement(ReactNative.View, null, children),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const A1 = { currency: 'THB', hash: 'a1', title: 'Kasikorn' };
const A2 = { currency: 'EUR', hash: 'a2', title: 'N26' };
const TX = { account: 'a1', category: 10, hash: 'h1', timestamp: 1, title: 'Coffee', type: 0, value: 40 };

let renderer;

const render = (params = TX) => {
  act(() => {
    renderer = TestRenderer.create(<Clone route={{ params }} navigation={{ goBack: () => {} }} />);
  });
};

const button = (label) =>
  renderer.root
    .findAllByProps({ testID: 'button' })
    .find((node) => typeof node.type === 'function' && node.props.children === label);

describe('screens/Clone save button', () => {
  beforeEach(() => {
    mockStore = { accounts: [A1, A2], createTx: jest.fn(), deleteTx: jest.fn(), updateTx: jest.fn() };
  });

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
  });

  test('a complete transaction can be saved as soon as it opens', () => {
    render();

    expect(button(L10N.SAVE).props.disabled).toBe(false);
  });

  // Only the account changed, so the form never spoke, and the stored flag kept Save off for good.
  test('changing only the account still leaves it saveable', () => {
    render();
    act(() => mockForm.onSelectAccount(A2));

    expect(button(L10N.SAVE).props.disabled).toBe(false);
    expect(button(L10N.DUPLICATE).props.disabled).toBe(true);
  });

  test('blanking a field turns it off, and filling it back turns it on', () => {
    render();

    act(() => mockForm.onChange({ form: { ...mockForm.form, title: '' }, valid: false }));
    expect(button(L10N.SAVE).props.disabled).toBe(true);

    act(() => mockForm.onChange({ form: { ...mockForm.form, title: 'Coffee' }, valid: true }));
    expect(button(L10N.SAVE).props.disabled).toBe(false);
  });
});
