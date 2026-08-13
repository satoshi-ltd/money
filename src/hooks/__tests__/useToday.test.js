import React from 'react';
import { AppState } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { useToday } from '../useToday';

const INTERVAL = 1000;

const render = () => {
  const values = [];
  const Probe = () => {
    values.push(useToday(INTERVAL));
    return null;
  };

  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Probe />);
  });

  return { renderer, values };
};

describe('hooks/useToday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 20, 23, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('keeps the same date while the day does not change', () => {
    const { renderer, values } = render();

    act(() => {
      jest.setSystemTime(new Date(2026, 4, 20, 23, 59, 0));
      jest.advanceTimersByTime(INTERVAL * 5);
    });

    expect(values).toHaveLength(1);
    act(() => renderer.unmount());
  });

  test('moves on when the clock crosses midnight', () => {
    const { renderer, values } = render();

    act(() => {
      jest.setSystemTime(new Date(2026, 4, 21, 0, 1, 0));
      jest.advanceTimersByTime(INTERVAL);
    });

    expect(values).toHaveLength(2);
    expect(values[1].getDate()).toBe(21);
    act(() => renderer.unmount());
  });

  test('catches up when the app comes back to the foreground', () => {
    const listeners = [];
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((event, listener) => {
      listeners.push(listener);
      return { remove: jest.fn() };
    });

    const { renderer, values } = render();

    act(() => {
      jest.setSystemTime(new Date(2026, 4, 25, 9, 0, 0));
      listeners.forEach((listener) => listener('active'));
    });

    expect(values[values.length - 1].getDate()).toBe(25);
    act(() => renderer.unmount());
    spy.mockRestore();
  });
});
