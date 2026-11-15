import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import FormTransfer from '../FormTransfer';

let mockRates = {};

const FROM = { hash: 'a1', title: 'Cash', currency: 'EUR', currentBalance: 100 };
const TO = { hash: 'a2', title: 'Savings', currency: 'EUR', currentBalance: 0 };

jest.mock('../../../../contexts', () => ({
  useStore: () => ({
    accounts: [
      { hash: 'a1', title: 'Cash', currency: 'EUR', currentBalance: 100 },
      { hash: 'a2', title: 'Savings', currency: 'EUR', currentBalance: 0 },
      { hash: 'a3', title: 'Dollars', currency: 'USD', currentBalance: 0 },
    ],
    rates: mockRates,
    settings: { baseCurrency: 'EUR' },
  }),
}));

jest.mock('../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Dropdown: stub('dropdown'),
    FieldRow: ({ children, label }) => MockReact.createElement(ReactNative.View, { testID: 'fieldrow', label }, children),
    Input: stub('input'),
    PriceFriendly: stub('price'),
    Text: ({ children }) => MockReact.createElement(ReactNative.Text, null, children),
    View: stub('view'),
  };
});

let renderer;

const render = (onChange, form = { destination: 'a2', from: FROM, to: TO }) => {
  act(() => {
    renderer = TestRenderer.create(<FormTransfer account={FROM} form={form} onChange={onChange} />);
  });
  return renderer.root;
};

afterEach(() => {
  mockRates = {};
  act(() => renderer?.unmount());
  renderer = undefined;
});

const amountInputs = (root) => root.findAllByProps({ testID: 'input' }).filter((node) => typeof node.type === 'string' && node.props.onChange);

describe('screens/Transaction/FormTransfer', () => {
  test('a comma decimal in Send is a decimal, not the end of the number', () => {
    const onChange = jest.fn();
    const root = render(onChange);

    act(() => amountInputs(root)[0].props.onChange('12,5'));

    const { form, valid } = onChange.mock.calls.at(-1)[0];
    expect(form.value).toBe('12.5');
    expect(form.exchange).toBe(12.5);
    expect(valid).toBe(true);
  });

  test('a comma decimal in Receive is read whole', () => {
    const onChange = jest.fn();
    const root = render(onChange, { destination: 'a2', from: FROM, to: TO, value: '10' });

    act(() => amountInputs(root)[1].props.onChange('9,75'));

    expect(onChange.mock.calls.at(-1)[0].form.exchange).toBe('9.75');
  });

  test('text that is not an amount empties the field and leaves Save off', () => {
    const onChange = jest.fn();
    const root = render(onChange);

    act(() => amountInputs(root)[0].props.onChange('12,5,3'));

    const { form, valid } = onChange.mock.calls.at(-1)[0];
    expect(form.value).toBeUndefined();
    expect(valid).toBe(false);
  });

  test('a swap into another currency converts at the newest month, not the last one written', () => {
    mockRates = { '2026-08': { USD: 1.05 }, '2026-10': { USD: 1.2 }, '2026-09': { USD: 1.1 } };
    const onChange = jest.fn();
    const dollars = { hash: 'a3', title: 'Dollars', currency: 'USD', currentBalance: 0 };
    const root = render(onChange, { destination: 'a3', from: FROM, to: dollars });

    act(() => amountInputs(root)[0].props.onChange('10'));

    expect(onChange.mock.calls.at(-1)[0].form.exchange).toBe(12);
  });

  test('a field the form has no amount for stays a controlled, empty input', () => {
    const root = render(jest.fn());

    expect(amountInputs(root).map((node) => node.props.value)).toEqual(['', '']);
  });
});
