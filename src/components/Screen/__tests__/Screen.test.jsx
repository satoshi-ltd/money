import React from 'react';
import { ScrollView as RNScrollView, View as RNView } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Screen from '../Screen';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: {} }) }));
jest.mock('../../../hooks', () => ({ useKeyboardInset: () => mockKeyboard }));

let mockKeyboard = { height: 0, top: 0 };

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Screen {...props} />);
  });
  return renderer.root;
};

const heightOf = ({ props }) => {
  const style = Array.isArray(props.style) ? Object.assign({}, ...props.style.flat(9).filter(Boolean)) : props.style;
  return style?.height;
};

describe('components/Screen', () => {
  afterEach(() => {
    mockKeyboard = { height: 0, top: 0 };
  });

  test('reserves the space the keyboard takes so the content can clear it', () => {
    mockKeyboard = { height: 312, top: 540 };

    const spacers = render({}).findAllByType(RNView).filter((node) => heightOf(node) === 312);

    expect(spacers).toHaveLength(1);
  });

  test('reserves nothing while the keyboard is down', () => {
    const spacers = render({}).findAllByType(RNView).filter((node) => heightOf(node));

    expect(spacers).toHaveLength(0);
  });

  test('lets the scroll view move out of the keyboard and keeps taps working', () => {
    const scroll = render({}).findByType(RNScrollView);

    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.keyboardDismissMode).toBe('on-drag');
    expect(scroll.props.automaticallyAdjustKeyboardInsets).toBe(true);
  });

  test('does not scroll when the screen hosts its own list', () => {
    const root = render({ disableScroll: true });

    expect(root.findAllByType(RNScrollView)).toHaveLength(0);
    expect(root.findAllByType(RNView).length).toBeGreaterThan(0);
  });

  test('keeps caller props over the defaults', () => {
    const scroll = render({ keyboardDismissMode: 'none' }).findByType(RNScrollView);

    expect(scroll.props.keyboardDismissMode).toBe('none');
  });
});
