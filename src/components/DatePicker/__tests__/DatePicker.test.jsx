import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { setLanguage } from '../../../i18n';
import { DatePicker } from '../DatePicker';

let mockLanguage = 'en';

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', border: '#BBBBBB', textMuted: '#777777', onAccent: '#0', text: '#111111' },
    formatDate: (date, options) => new Intl.DateTimeFormat(mockLanguage, options).format(date),
    language: mockLanguage,
    textScale: 1,
  }),
}));

jest.mock('../../Modal', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { __esModule: true, default: ({ children, onClose }) => MockReact.createElement(ReactNative.View, { testID: 'modal', onClose }, children) };
});

const VALUE = new Date(2026, 8, 9, 17, 30, 12, 345);
const MAX = new Date(2026, 9, 1);

const setPlatform = (os) => {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
};

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<DatePicker maximumDate={MAX} onClose={() => {}} onSelect={() => {}} value={VALUE} {...props} />);
  });
  return renderer.root;
};

const texts = (root) => root.findAll((node) => typeof node.type === 'string' && node.type === 'Text').map((node) => [node.props.children].flat().join(''));
const named = (root, label) => root.findAll((node) => node.props.accessibilityLabel === label && node.props.onPress)[0];
const press = (node) => act(() => node.props.onPress());
const dayLabel = (day, month = 8) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }).format(new Date(2026, month, day));
const modals = (root) => root.findAll((node) => typeof node.type === 'string' && node.props.testID === 'modal');
const day = (root, number, month) => named(root, dayLabel(number, month));
const button = (root, label) => root.findAll((node) => node.props.accessibilityRole === 'button' && texts(node).includes(label) && node.props.onPress)[0];

afterEach(() => {
  mockLanguage = 'en';
  setLanguage('en');
  setPlatform('ios');
});

describe.each(['ios', 'android'])('components/DatePicker on %s', (os) => {
  beforeEach(() => setPlatform(os));

  test('draws its own month in a sheet, never a system dialog', () => {
    const root = render();

    expect(modals(root)).toHaveLength(1);
    expect(texts(root)).toContain('September 2026');
    expect(day(root, 30)).toBeTruthy();
    expect(day(root, 31)).toBeUndefined();
  });

  test('the day it opens on is the one marked chosen, and no other', () => {
    const root = render();
    const chosen = root.findAll((node) => typeof node.type === 'string' && node.props.accessibilityState?.selected && node.props.accessibilityLabel);

    expect(chosen.map((node) => node.props.accessibilityLabel)).toEqual([dayLabel(9)]);
  });

  test('every day is announced by its full name', () => {
    const root = render();

    expect(day(root, 4).props.accessibilityLabel).toBe('Friday, September 4, 2026');
    expect(day(root, 4).props.accessibilityRole).toBe('button');
  });

  test('Accept hands over the picked day at the time of the value, then closes', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const root = render({ onClose, onSelect });

    press(day(root, 4));
    expect(onSelect).not.toHaveBeenCalled();
    press(button(root, 'Accept'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].getTime()).toBe(new Date(2026, 8, 4, 17, 30, 12, 345).getTime());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Cancel closes without handing anything over', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const root = render({ onClose, onSelect });

    press(day(root, 4));
    press(button(root, 'Cancel'));

    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('the sheet closing on its own closes the picker without a date', () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const root = render({ onClose, onSelect });

    modals(root)[0].props.onClose();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('days after the maximum can be neither tapped nor chosen', () => {
    const root = render({ maximumDate: new Date(2026, 8, 12, 9) });

    expect(day(root, 12).props.disabled).toBe(false);
    expect(day(root, 13).props.disabled).toBe(true);
    expect(day(root, 13).props.accessibilityState.disabled).toBe(true);
  });

  test('days before the minimum can be neither tapped nor chosen', () => {
    const root = render({ minimumDate: new Date(2026, 8, 5, 20) });

    expect(day(root, 4).props.disabled).toBe(true);
    expect(day(root, 5).props.disabled).toBe(false);
  });

  test('picking the last allowed day never puts the entry in the future', () => {
    const onSelect = jest.fn();
    const now = new Date(2026, 8, 9, 8, 0);
    const root = render({ maximumDate: now, onSelect, value: new Date(2026, 8, 2, 20, 0) });

    press(day(root, 9));
    press(button(root, 'Accept'));

    expect(onSelect.mock.calls[0][0].getTime()).toBe(now.getTime());
  });

  test('Accept is off while the open day is outside the bounds', () => {
    const root = render({ maximumDate: new Date(2026, 8, 5), value: new Date(2026, 8, 9) });

    expect(button(root, 'Accept').props.disabled).toBe(true);
  });

  test('the arrows walk the months and name where they go', () => {
    const root = render({ maximumDate: new Date(2026, 11, 31) });

    press(named(root, 'Next month'));
    expect(texts(root)).toContain('October 2026');
    expect(day(root, 31, 9)).toBeTruthy();
    press(named(root, 'Previous month'));
    press(named(root, 'Previous month'));
    expect(texts(root)).toContain('August 2026');
  });

  test('a month holds its chosen day when you leave it and come back', () => {
    const onSelect = jest.fn();
    const root = render({ maximumDate: new Date(2026, 11, 31), onSelect });

    press(day(root, 4));
    press(named(root, 'Next month'));
    press(day(root, 15, 9));
    press(named(root, 'Previous month'));
    press(button(root, 'Accept'));

    expect(onSelect.mock.calls[0][0].getTime()).toBe(new Date(2026, 9, 15, 17, 30, 12, 345).getTime());
  });

  test('there is no way past the maximum month nor before the minimum one', () => {
    const root = render({ maximumDate: new Date(2026, 8, 20), minimumDate: new Date(2026, 8, 2) });

    expect(named(root, 'Next month').props.disabled).toBe(true);
    expect(named(root, 'Previous month').props.disabled).toBe(true);
  });

  test('a maximum on the first of the next month still opens that month', () => {
    const root = render({ maximumDate: new Date(2026, 9, 1) });

    expect(named(root, 'Next month').props.disabled).toBe(false);
    press(named(root, 'Next month'));
    expect(day(root, 1, 9).props.disabled).toBe(false);
    expect(day(root, 2, 9).props.disabled).toBe(true);
    expect(named(root, 'Next month').props.disabled).toBe(true);
  });

  test('a date past the maximum still opens with a way back to the days that can be chosen', () => {
    const onSelect = jest.fn();
    const root = render({ maximumDate: new Date(2026, 8, 9), onSelect, value: new Date(2026, 11, 20, 10) });

    expect(named(root, 'Next month').props.disabled).toBe(true);
    expect(named(root, 'Previous month').props.disabled).toBe(false);
    ['November', 'October', 'September'].forEach((month) => {
      press(named(root, 'Previous month'));
      expect(texts(root)).toContain(`${month} 2026`);
    });
    press(day(root, 4));
    press(button(root, 'Accept'));

    expect(onSelect.mock.calls[0][0].getTime()).toBe(new Date(2026, 8, 4, 10).getTime());
  });

  test('a date before the minimum opens with a way forward', () => {
    const root = render({ maximumDate: new Date(2026, 11, 31), minimumDate: new Date(2026, 8, 5), value: new Date(2026, 5, 3) });

    expect(named(root, 'Previous month').props.disabled).toBe(true);
    expect(named(root, 'Next month').props.disabled).toBe(false);
  });

  test('the month title is announced when an arrow changes it', () => {
    const header = render().findAll((node) => node.props.accessibilityRole === 'header')[0];

    expect(header.props.accessibilityLiveRegion).toBe('polite');
  });

  test('today is outlined and the chosen day wears the accent', () => {
    const today = new Date();
    const other = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1, 12);
    const root = render({ maximumDate: undefined, value: other });
    const nameOf = (date) => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', weekday: 'long', year: 'numeric' }).format(date);
    const flat = (node) => StyleSheet.flatten(node.props.style);
    const todayCell = named(root, nameOf(today));
    const chosenCell = named(root, nameOf(other));

    expect(flat(todayCell).borderWidth).toBeGreaterThan(0);
    expect(flat(chosenCell).backgroundColor).toBe('#ACCE07');
    expect(flat(chosenCell).borderWidth).toBeUndefined();
  });
});

describe('components/DatePicker in the language of the reader', () => {
  test('names the month in the dictionary and opens the week on Monday', () => {
    mockLanguage = 'es';
    setLanguage('es');
    const root = render({ value: new Date(2026, 8, 9) });
    const header = root.findAll((node) => node.props.accessibilityElementsHidden)[0];

    expect(texts(root)).toContain('Septiembre 2026');
    expect(texts(header)).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(day(root, 4)).toBeUndefined();
    expect(named(root, 'Mes siguiente')).toBeTruthy();
  });

  test('English opens the week on Sunday', () => {
    const root = render();
    const header = root.findAll((node) => node.props.accessibilityElementsHidden)[0];

    expect(texts(header)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  test('the weekday header is hidden from a screen reader, since every day names itself', () => {
    const header = render().findAll((node) => node.props.accessibilityElementsHidden)[0];

    expect(header.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
