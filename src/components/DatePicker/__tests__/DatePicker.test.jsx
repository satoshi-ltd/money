import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { DatePicker } from '../DatePicker';

const mockOpen = jest.fn();
const mockDismiss = jest.fn((mode) => {
  if (typeof mode !== 'string') throw new TypeError('dismiss takes the mode as a string');
  return Promise.resolve(true);
});

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: 'DateTimePicker',
  DateTimePickerAndroid: { dismiss: (...args) => mockDismiss(...args), open: (...args) => mockOpen(...args) },
}));

jest.mock('../../../contexts', () => ({ useApp: () => ({ colors: { accent: '#ACCE07', text: '#TEXT00' }, theme: 'dark' }) }));

jest.mock('../../Modal', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { __esModule: true, default: ({ children, onClose }) => MockReact.createElement(ReactNative.View, { testID: 'modal', onClose }, children) };
});

const VALUE = new Date(2026, 8, 9);
const MAX = new Date(2026, 9, 1);

const setPlatform = (os) => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
};

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<DatePicker maximumDate={MAX} onClose={() => {}} onSelect={() => {}} value={VALUE} {...props} />);
  });
  return renderer;
};

afterEach(() => {
  setPlatform('ios');
  mockOpen.mockClear();
  mockDismiss.mockClear();
});

describe('components/DatePicker on Android', () => {
  beforeEach(() => setPlatform('android'));

  test('opens the system calendar itself and draws nothing, so no sheet of ours covers it', () => {
    const renderer = render();

    expect(renderer.root.findAllByProps({ testID: 'modal' })).toHaveLength(0);
    expect(renderer.root.findAllByType('DateTimePicker')).toHaveLength(0);
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen.mock.calls[0][0]).toMatchObject({ display: 'calendar', maximumDate: MAX, mode: 'date', value: VALUE });
  });

  test('a chosen day is handed over and the picker closes; dismissing only closes it', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render({ onClose, onSelect });
    const { onChange } = mockOpen.mock.calls[0][0];
    const day = new Date(2026, 8, 20);

    onChange({ type: 'set' }, day);
    expect(onSelect).toHaveBeenCalledWith(day);
    expect(onClose).toHaveBeenCalledTimes(1);

    onChange({ type: 'dismissed' }, undefined);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('a new render does not reopen the calendar and the answer reaches the latest callbacks', () => {
    const first = jest.fn();
    const second = jest.fn();
    const renderer = render({ onSelect: first });
    act(() => renderer.update(<DatePicker maximumDate={MAX} onClose={() => {}} onSelect={second} value={VALUE} />));

    expect(mockOpen).toHaveBeenCalledTimes(1);
    mockOpen.mock.calls[0][0].onChange({ type: 'set' }, VALUE);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(VALUE);
  });

  test('leaving the screen dismisses a calendar still open', () => {
    const renderer = render();
    act(() => renderer.unmount());

    expect(mockDismiss).toHaveBeenCalledWith('date');
  });

  test('closing after an answer leaves nothing to dismiss and unmounting does not throw', () => {
    const renderer = render();
    mockOpen.mock.calls[0][0].onChange({ type: 'dismissed' }, VALUE);

    expect(() => act(() => renderer.unmount())).not.toThrow();
    expect(mockDismiss).not.toHaveBeenCalled();
  });

  test('a dismiss that fails never reaches the error boundary', () => {
    mockDismiss.mockImplementationOnce(() => {
      throw new TypeError('no such picker');
    });
    const renderer = render();

    expect(() => act(() => renderer.unmount())).not.toThrow();
  });
});

describe('components/DatePicker on iOS', () => {
  beforeEach(() => setPlatform('ios'));

  test('is the inline calendar in the bottom sheet, in the theme the app resolved', () => {
    const renderer = render();
    const [picker] = renderer.root.findAllByType('DateTimePicker');

    expect(mockOpen).not.toHaveBeenCalled();
    expect(renderer.root.findAllByProps({ testID: 'modal' }).filter((node) => typeof node.type === 'string')).toHaveLength(1);
    expect(picker.props).toMatchObject({ accentColor: '#ACCE07', display: 'inline', maximumDate: MAX, themeVariant: 'dark', value: VALUE });
  });

  test('a day is handed over and the sheet closes; a change with no day does nothing', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const renderer = render({ onClose, onSelect });
    const [picker] = renderer.root.findAllByType('DateTimePicker');
    const day = new Date(2026, 8, 20);

    act(() => picker.props.onChange({}, undefined));
    expect(onSelect).not.toHaveBeenCalled();
    act(() => picker.props.onChange({}, day));

    expect(onSelect).toHaveBeenCalledWith(day);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
