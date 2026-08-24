import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Account } from '../Account';
import { L10N } from '../../../modules';

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../../../services', () => ({ ServiceRates: { get: jest.fn(() => Promise.resolve()) } }));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Button: stub('button'),
    Heading: stub('heading'),
    InputAmount: stub('input-amount'),
    InputCurrency: stub('input-currency'),
    InputField: stub('input-field'),
    Panel: ({ children, footerElement }) =>
      MockReact.createElement(ReactNative.View, null, children, footerElement),
    Text: (props) => MockReact.createElement(ReactNative.Text, { testID: 'text', ...props }),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const render = (params = {}) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <Account route={{ params }} navigation={{ goBack: () => {}, navigate: () => {} }} />,
    );
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/Account', () => {
  beforeEach(() => {
    mockStore = {
      settings: { baseCurrency: 'EUR' },
      createAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn(),
      updateRates: jest.fn(),
    };
  });

  test('every field is a row with a muted label on the left', () => {
    const labels = componentsBy(render(), 'text').filter(
      (node) => node.props.size === 's' && node.props.tone === 'muted',
    );

    expect(labels.map((node) => node.props.children)).toEqual([L10N.CURRENCY, L10N.INITIAL_BALANCE, L10N.NAME]);
  });

  test('the inputs carry no floating label of their own', () => {
    const root = render();

    expect(componentsBy(root, 'input-currency')[0].props.label).toBeNull();
    expect(componentsBy(root, 'input-amount')[0].props.label).toBeNull();
    expect(componentsBy(root, 'input-field')[0].props.label).toBeUndefined();
  });

  test('editing offers delete, cancel and save, each growing', () => {
    const buttons = componentsBy(render({ hash: 'a1', currency: 'EUR', title: 'N26' }), 'button');

    expect(buttons.map((node) => node.props.children)).toEqual([L10N.DELETE, L10N.CANCEL, L10N.SAVE]);
    expect(buttons.map((node) => node.props.variant)).toEqual(['dangerSoft', 'outlined', undefined]);
    expect(buttons.every((node) => node.props.grow)).toBe(true);
  });

  test('creating drops the delete button', () => {
    const buttons = componentsBy(render(), 'button');

    expect(buttons.map((node) => node.props.children)).toEqual([L10N.CANCEL, L10N.SAVE]);
  });

  test('the first-account flow leaves only save, disabled until it is named', () => {
    const buttons = componentsBy(render({ firstAccount: true }), 'button');

    expect(buttons.map((node) => node.props.children)).toEqual([L10N.SAVE]);
    expect(buttons[0].props.disabled).toBe(true);
  });
});
