import React from 'react';
import { ScrollView as RNScrollView, View as RNView } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Screen from '../Screen';

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: {} }) }));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Screen {...props} />);
  });
  return renderer.root;
};

describe('components/Screen', () => {
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
