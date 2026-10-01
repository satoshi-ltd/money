import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { InputAmount } from '../InputAmount';

jest.mock('../../../contexts', () => ({
  useStore: () => ({ settings: { baseCurrency: 'EUR' }, rates: { '2026-01': { USD: 2 } } }),
}));

jest.mock('../../InputField', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { InputField: (props) => MockReact.createElement(ReactNative.View, { testID: 'field', ...props }) };
});

jest.mock('../../PriceFriendly', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { PriceFriendly: (props) => MockReact.createElement(ReactNative.View, { testID: 'price', ...props }) };
});

const type = (props, text) => {
  const onChange = jest.fn();
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<InputAmount account={{ currency: 'EUR' }} onChange={onChange} {...props} />);
  });
  const field = renderer.root.findByProps({ testID: 'field' });
  act(() => field.props.onChange(text));

  return { field, onChange };
};

const priceSuffix = (value) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<InputAmount account={{ currency: 'USD' }} signed value={value} onChange={() => {}} />);
  });
  const { suffix } = renderer.root.findByProps({ testID: 'field' }).props;

  return suffix ? suffix.props.children.props : undefined;
};

describe('components/InputAmount', () => {
  test('a lone minus on a foreign account shows no base equivalent, never "NaN"', () => {
    expect(priceSuffix('-')).toBeUndefined();
    expect(priceSuffix('-50').value).toBe(-25);
  });

  test('refuses a minus unless the field is signed, so an expense is never typed negative', () => {
    expect(type({}, '-5').onChange).toHaveBeenCalledWith(undefined);
    expect(type({}, '12,5').onChange).toHaveBeenCalledWith('12.5');
  });

  test('a signed field takes a minus, a decimal and a lone minus on the way to a number', () => {
    expect(type({ signed: true }, '-1284,30').onChange).toHaveBeenCalledWith('-1284.30');
    expect(type({ signed: true }, '-').onChange).toHaveBeenCalledWith('-');
    expect(type({ signed: true }, '--5').onChange).toHaveBeenCalledWith(undefined);
    expect(type({ signed: true }, '5-').onChange).toHaveBeenCalledWith(undefined);
  });

  test('on iOS a signed field uses the keyboard that has a minus key', () => {
    const original = Platform.OS;
    Platform.OS = 'ios';
    const signed = type({ signed: true }, '1').field.props.keyboardType;
    const plain = type({}, '1').field.props.keyboardType;
    Platform.OS = original;

    expect(signed).toBe('numbers-and-punctuation');
    expect(plain).toBe('numeric');
  });
});
