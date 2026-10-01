import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Rail from '../Rail';
import { ICON, L10N } from '../../../modules';
import { railWidth } from '../../../theme/layout';

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#FFBC2D', background: '#F6F4EE', border: '#DCD7C7', onAccent: '#2A2008', surfaceSoft: '#E6E2D5', text: '#15140F' },
    textScale: 1,
  }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => mockInsets }));

let mockInsets = { bottom: 0, left: 0, top: 0 };

const ROUTE_NAMES = ['dashboard', 'accounts', 'transaction', 'stats', 'settings'];

const buildProps = (overrides = {}) => ({
  state: { index: 0, routes: ROUTE_NAMES.map((name) => ({ key: `${name}-key`, name })) },
  descriptors: Object.fromEntries(
    ROUTE_NAMES.map((name) => [
      `${name}-key`,
      {
        options: {
          tabBarAccessibilityLabel: `spoken-${name}`,
          tabBarLabel: ({ focused, size }) => <RNText>{`label-${name}-${size}-${focused ? 'on' : 'off'}`}</RNText>,
        },
      },
    ]),
  ),
  navigation: { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() },
  onActionPress: jest.fn(),
  ...overrides,
});

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Rail {...props} />);
  });
  return renderer.root;
};

const tabs = (root) => root.findAll((node) => typeof node.type === 'string' && node.props.accessibilityRole === 'tab');
const textsOf = (root) => root.findAllByType(RNText).map((node) => [node.props.children].flat().join(''));

afterEach(() => {
  mockInsets = { bottom: 0, left: 0, top: 0 };
});

describe('components/Rail', () => {
  test('lists the four tabs by name and state, and none of the seal route', () => {
    const root = render(buildProps());

    expect(tabs(root).map((tab) => tab.props.accessibilityLabel)).toEqual(['spoken-dashboard', 'spoken-accounts', 'spoken-stats', 'spoken-settings']);
    expect(tabs(root).map((tab) => tab.props.accessibilityState.selected)).toEqual([true, false, false, false]);
    expect(textsOf(root).some((text) => text.includes('transaction'))).toBe(false);
  });

  test('the selected tab is the one whose route is focused, not the one at the same position in the list', () => {
    const root = render(buildProps({ state: { index: 3, routes: ROUTE_NAMES.map((name) => ({ key: `${name}-key`, name })) } }));

    expect(tabs(root).map((tab) => tab.props.accessibilityState.selected)).toEqual([false, false, true, false]);
    expect(textsOf(root)).toContain('label-stats-s-on');
  });

  test('the labels are drawn at the rail size, the focused one marked', () => {
    expect(textsOf(render(buildProps()))).toEqual(expect.arrayContaining(['label-dashboard-s-on', 'label-accounts-s-off']));
  });

  test('a tab press navigates unless the tab is current or the press was prevented, and always emits', () => {
    const props = buildProps();
    const root = render(props);
    const press = (name) =>
      act(() => root.findAll((node) => typeof node.type !== 'string' && node.props.accessibilityLabel === `spoken-${name}` && node.props.onPress)[0].props.onPress());

    press('dashboard');
    expect(props.navigation.emit).toHaveBeenCalledTimes(1);
    expect(props.navigation.navigate).not.toHaveBeenCalled();

    press('accounts');
    expect(props.navigation.navigate).toHaveBeenCalledWith('accounts');

    props.navigation.emit.mockReturnValue({ defaultPrevented: true });
    props.navigation.navigate.mockClear();
    press('stats');
    expect(props.navigation.navigate).not.toHaveBeenCalled();
  });

  test('New is a named button that opens a new expense', () => {
    const props = buildProps();
    const root = render(props);
    const button = root.findAll((node) => typeof node.type === 'function' && node.props.accessibilityLabel === L10N.EMPTY_TRANSACTIONS_ACTION && node.props.onPress)[0];

    expect(textsOf(root)).toContain(L10N.NEW);
    expect(button.props.icon).toBe(ICON.ADD);
    act(() => button.props.onPress());
    expect(props.onActionPress).toHaveBeenCalledTimes(1);
  });

  test('the words have room: the tab padding leaves 80 points or more inside the rail', () => {
    const tab = StyleSheet.flatten(tabs(render(buildProps()))[0].props.style);

    expect(railWidth - 2 * 12 - 2 * tab.paddingHorizontal).toBeGreaterThanOrEqual(80);
  });

  test('the wordmark sits above the tabs and the rail is its fixed width, with a hairline on the content side', () => {
    const root = render(buildProps());
    const rail = StyleSheet.flatten(root.findAll((node) => typeof node.type === 'string')[0].props.style);

    expect(textsOf(root)[0]).toBe('MÔNEY');
    expect(rail.width).toBe(railWidth);
    expect(rail.borderRightWidth).toBeGreaterThan(0);
  });

  test('clears the status bar, the home indicator and a cutout on its own side', () => {
    mockInsets = { bottom: 34, left: 44, top: 47 };
    const rail = StyleSheet.flatten(render(buildProps()).findAll((node) => typeof node.type === 'string')[0].props.style);

    expect(rail.paddingTop).toBe(47);
    expect(rail.paddingBottom).toBeGreaterThanOrEqual(34);
    expect(rail.paddingLeft).toBeGreaterThanOrEqual(44);
  });
});
