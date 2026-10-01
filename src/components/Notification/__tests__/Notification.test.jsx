import React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
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

  describe('a screen reader', () => {
    const setPlatform = (os) => Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
    const spoken = () => AccessibilityInfo.announceForAccessibility.mock.calls.map(([message]) => message);
    const queued = () => AccessibilityInfo.announceForAccessibilityWithOptions.mock.calls;

    beforeEach(() => {
      jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
      AccessibilityInfo.announceForAccessibility.mockClear();
      AccessibilityInfo.announceForAccessibilityWithOptions.mockClear();
    });
    afterEach(() => {
      setPlatform('ios');
      jest.restoreAllMocks();
    });

    test('hears a band arrive on iOS, queued behind whatever it is already saying, with its title and its text', () => {
      setPlatform('ios');
      show({ text: 'Back up your data', title: 'Backup' });

      expect(queued()).toEqual([['Backup. Back up your data', { queue: true }]]);
      expect(spoken()).toEqual([]);
    });

    test('hears a band arrive on Android too, once', () => {
      setPlatform('android');
      show({ text: 'Back up your data', title: 'Backup' });

      expect(spoken()).toEqual(['Backup. Back up your data']);
      expect(queued()).toEqual([]);
    });

    test('hears the default title when a band has none, and a band with no text says only its title', () => {
      setPlatform('android');
      show({ error: true, tapToDismiss: false });

      expect(spoken()).toEqual([L10N.ERROR]);
    });

    test('hears the next band when one replaces another, not only the first, and an error repeated is heard again', () => {
      setPlatform('android');
      show({ title: 'First' });
      act(() => {
        eventEmitter.emit(C.EVENT.NOTIFICATION, { title: 'Second' });
      });
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      act(() => {
        eventEmitter.emit(C.EVENT.NOTIFICATION, { error: true, title: 'Rates did not answer' });
      });
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      act(() => {
        eventEmitter.emit(C.EVENT.NOTIFICATION, { error: true, title: 'Rates did not answer' });
      });
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(spoken()).toEqual(['First', 'Second', 'Rates did not answer', 'Rates did not answer']);
    });
  });
});
