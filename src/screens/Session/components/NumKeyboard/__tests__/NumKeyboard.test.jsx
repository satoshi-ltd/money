import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { NumKeyboard } from '../NumKeyboard';

jest.mock('../../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    View: ({ flex, ...props }) => MockReact.createElement(ReactNative.View, props),
    Text: ({ bold, medium, size, tone, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { ...props, testID: props.testID || 'nk-slot' }),
    Icon: ({ name, testID }) => MockReact.createElement(ReactNative.View, { testID, accessibilityLabel: name }),
  };
});

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<NumKeyboard onPress={() => {}} {...props} />);
  });
  return renderer.root;
};

const pressableOver = (node) => {
  let current = node;
  while (current && !current.props?.onPress) current = current.parent;
  return current;
};

describe('screens/Session/NumKeyboard', () => {
  test('digits call onPress with their number', () => {
    const onPress = jest.fn();
    const root = render({ onPress });

    const seven = root.findAllByType(RNText).find((node) => node.props.children === 7);
    act(() => pressableOver(seven).props.onPress());

    expect(onPress).toHaveBeenCalledWith(7);
  });

  test('shows a delete key wired to onDelete', () => {
    const onDelete = jest.fn();
    const root = render({ onDelete });

    const key = root.findByProps({ testID: 'numkeyboard-delete' });
    act(() => pressableOver(key).props.onPress());

    expect(onDelete).toHaveBeenCalled();
  });

  test('the pin is the only way in: no biometric key', () => {
    const root = render({ onBiometric: () => {} });

    expect(root.findAllByProps({ testID: 'numkeyboard-biometric' })).toHaveLength(0);
    expect(root.findAllByProps({ accessibilityLabel: 'fingerprint' })).toHaveLength(0);
  });

  test('renders every digit on the figure ramp', () => {
    const root = render({});

    const digits = root.findAllByType(RNText).filter((node) => typeof node.props.children === 'number');

    expect(digits).toHaveLength(10);
    digits.forEach((node) => expect(node.props.figure).toBe('xl'));
  });

  test('renders the twelve key slots', () => {
    const root = render({});

    const slots = root.findAllByProps({ testID: 'nk-slot' }).filter((node) => typeof node.type === 'string');
    expect(slots).toHaveLength(12);
  });
});
