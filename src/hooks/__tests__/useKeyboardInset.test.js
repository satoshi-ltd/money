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

    expect(values[0]).toEqual({ height: 0, top: 0 });

    act(() => listeners.keyboardDidShow({ endCoordinates: { height: 312, screenY: 540 } }));
    expect(values[values.length - 1]).toEqual({ height: 312, top: 540 });

    act(() => listeners.keyboardDidHide());
    expect(values[values.length - 1]).toEqual({ height: 0, top: 0 });

    act(() => renderer.unmount());
  });

  test('ignores the spurious event Android sends with a negative height', () => {
    const { renderer, values } = render();

    act(() => listeners.keyboardDidShow({}));
    act(() => listeners.keyboardDidShow({ endCoordinates: { height: 0 } }));
    act(() => listeners.keyboardDidShow({ endCoordinates: { height: -24, screenY: 899 } }));

    expect(values[values.length - 1]).toEqual({ height: 0, top: 0 });

    act(() => renderer.unmount());
  });
});
