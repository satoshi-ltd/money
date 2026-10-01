import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Notification } from '../Notification';
import { C, eventEmitter, L10N } from '../../../modules';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', danger: '#DA0000', text: '#1', onAccent: '#0', background: '#F', rule: '#R' } }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0 }) }));

const host = (root, predicate) => root.findAll((node) => typeof node.type === 'string' && predicate(node.props));

let renderer;
const show = (payload) => {
  act(() => {
    renderer = TestRenderer.create(<Notification />);
  });
  act(() => {
    eventEmitter.emit(C.EVENT.NOTIFICATION, payload);
  });
  return renderer.root;
};

describe('components/Notification', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => renderer?.unmount());
    jest.useRealTimers();
  });

  test('the close glyph is a named button, reachable when the band itself does not dismiss', () => {
    const root = show({ error: true, tapToDismiss: false, title: 'Rates did not answer' });
    const [close] = host(root, (props) => props.accessibilityLabel === L10N.A11Y_CLOSE);
    const [band] = host(root, (props) => props.accessible === false && props.onPress === undefined);

    expect(close.props.accessibilityRole).toBe('button');
    expect(band).toBeDefined();
  });

  test('a band that dismisses on tap is one button with a dismiss hint', () => {
    const root = show({ title: 'Rates updated' });
    const [band] = host(root, (props) => props.accessibilityHint === L10N.A11Y_DISMISS);

    expect(band.props.accessibilityRole).toBe('button');
    expect(band.props.accessible).toBe(true);
  });
});
