import React from 'react';
import { Animated, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { SwipeRow } from '../SwipeRow';

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    PanGestureHandler: ({ children, ...props }) => MockReact.createElement(ReactNative.View, { testID: 'pan', ...props }, children),
    State: { CANCELLED: 3, END: 5, FAILED: 1 },
  };
});

const WIDTH = 160;
const END = 5;

let springs;
let ref;

beforeEach(() => {
  springs = [];
  ref = React.createRef();
  jest.spyOn(Animated, 'spring').mockImplementation((_value, config) => {
    springs.push(config.toValue);
    return { start: jest.fn() };
  });
});

afterEach(() => jest.restoreAllMocks());

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <SwipeRow ref={ref} actions={<RNText>actions</RNText>} actionsWidth={WIDTH}>
        <RNText>row</RNText>
      </SwipeRow>,
    );
  });
  return renderer.root.findByProps({ testID: 'pan' }).props;
};

const drag = (pan, translationX) => act(() => pan.onGestureEvent({ nativeEvent: { translationX } }));
const release = (pan, translationX, velocityX = 0) =>
  act(() => pan.onHandlerStateChange({ nativeEvent: { state: END, translationX, velocityX } }));

describe('components/TransactionsList/SwipeRow', () => {
  test('releasing past half the actions opens them, and a short drag leaves them closed', () => {
    const pan = render();

    release(pan, -(WIDTH / 2 + 1));
    expect(springs).toEqual([-WIDTH]);

    release(render(), -20);
    expect(springs).toEqual([-WIDTH, 0]);
  });

  test('a quick flick left opens the actions however short the drag', () => {
    const pan = render();

    release(pan, -20, -900);

    expect(springs).toEqual([-WIDTH]);
  });

  test('a drag never goes beyond the actions, so releasing a long one rests exactly on them', () => {
    const pan = render();

    drag(pan, -WIDTH * 3);
    release(pan, -WIDTH * 3);

    expect(springs).toEqual([-WIDTH]);
  });

  test('from open, a drag back to the right closes it and a flick right closes it at once', () => {
    const pan = render();
    release(pan, -WIDTH);

    release(pan, WIDTH / 2 + 1);
    release(pan, -WIDTH);
    release(pan, 10, 900);

    expect(springs).toEqual([-WIDTH, 0, -WIDTH, 0]);
  });

  test('the row can be closed from outside, as the edit and delete actions do', () => {
    const pan = render();
    release(pan, -WIDTH);

    act(() => ref.current.close());

    expect(springs).toEqual([-WIDTH, 0]);
    expect(pan.activeOffsetX).toEqual([-10, 10]);
    expect(pan.failOffsetY).toEqual([-10, 10]);
  });

  test('a gesture the system cancels puts the row back where it rested', () => {
    const pan = render();
    release(pan, -WIDTH);

    act(() => pan.onHandlerStateChange({ nativeEvent: { state: 3, translationX: 40, velocityX: 0 } }));

    expect(springs).toEqual([-WIDTH, -WIDTH]);
  });

  test('only the end of the gesture settles the row', () => {
    const pan = render();

    act(() => pan.onHandlerStateChange({ nativeEvent: { state: 4, translationX: -WIDTH, velocityX: -900 } }));

    expect(springs).toEqual([]);
  });
});
