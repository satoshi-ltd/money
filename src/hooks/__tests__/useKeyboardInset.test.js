import React from 'react';
import { Keyboard, Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { useKeyboardInset } from '../useKeyboardInset';

const listeners = {};

jest.spyOn(Keyboard, 'addListener').mockImplementation((event, handler) => {
  listeners[event] = handler;
  return { remove: jest.fn() };
});

const render = () => {
  const values = [];
  const Probe = () => {
    values.push(useKeyboardInset());
    return null;
  };

  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });

  return { renderer, values };
};

describe('hooks/useKeyboardInset', () => {
  beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));
  afterEach(() => jest.restoreAllMocks?.call(jest));

  test('reports the keyboard height Android sends, and forgets it on hide', () => {
    const { renderer, values } = render();

    expect(values[0]).toBe(0);

    act(() => listeners.keyboardDidShow({ endCoordinates: { height: 312 } }));
    expect(values[values.length - 1]).toBe(312);

    act(() => listeners.keyboardDidHide());
    expect(values[values.length - 1]).toBe(0);

    act(() => renderer.unmount());
  });

  test('ignores an event without a usable height', () => {
    const { renderer, values } = render();

    act(() => listeners.keyboardDidShow({}));
    expect(values[values.length - 1]).toBe(0);

    act(() => listeners.keyboardDidShow({ endCoordinates: { height: 0 } }));
    expect(values[values.length - 1]).toBe(0);

    act(() => renderer.unmount());
  });
});
