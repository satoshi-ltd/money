import React from 'react';
import { StyleSheet, Text as RNText, TouchableOpacity } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import Footer from '../Footer';

const COLORS = {
  accent: '#FFBC2D',
  accentSoft: '#F6E7C0',
  background: '#F6F4EE',
  border: '#DCD7C7',
  inverse: '#15140F',
  surface: '#EEEBE0',
  surfaceSoft: '#E6E2D5',
};

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: {
      accent: '#FFBC2D',
      accentSoft: '#F6E7C0',
      background: '#F6F4EE',
      border: '#DCD7C7',
      inverse: '#15140F',
      surface: '#EEEBE0',
      surfaceSoft: '#E6E2D5',
    },
    theme: 'light',
  }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));

const ROUTE_NAMES = ['dashboard', 'stats', 'transaction', 'accounts', 'settings'];

const buildProps = (overrides = {}) => ({
  state: {
    index: 0,
    routes: ROUTE_NAMES.map((name) => ({ key: `${name}-key`, name })),
  },
  descriptors: Object.fromEntries(
    ROUTE_NAMES.map((name) => [
      `${name}-key`,
      { options: { tabBarLabel: () => <RNText>{`label-${name}`}</RNText> } },
    ]),
  ),
  navigation: { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() },
  onActionPress: jest.fn(),
  ...overrides,
});

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Footer {...props} />);
  });
  return renderer.root;
};

describe('components/Footer', () => {
  test('the tabs are words: the plus is the only glyph in the bar', () => {
    const root = render(buildProps());

    const icons = root.findAll((node) => typeof node.type === 'function' && typeof node.props?.name === 'string');
    expect([...new Set(icons.map((node) => node.props.name))]).toEqual(['plus']);
    expect(root.findAllByType(RNText).filter((node) => node.props.children === 'label-transaction')).toHaveLength(0);
  });

  test('the focused tab is marked by a block, not a colour', () => {
    const root = render(buildProps());
    const tabs = root.findAllByType(TouchableOpacity);
    const flat = (node) => StyleSheet.flatten(node.props.style);

    expect(flat(tabs[0]).backgroundColor).toBe(COLORS.surfaceSoft);
    expect(flat(tabs[0]).borderRadius).toBe(4);
    expect(flat(tabs[1]).backgroundColor).toBeUndefined();
  });

  test('the action button uses the plus icon', () => {
    const root = render(buildProps());

    expect(root.findAllByProps({ name: 'plus' }).length).toBeGreaterThan(0);
  });

  test('renders the label of every real tab', () => {
    const root = render(buildProps());
    const labels = root.findAllByType(RNText).map((node) => node.props.children);

    ['dashboard', 'stats', 'accounts', 'settings'].forEach((name) => {
      expect(labels).toContain(`label-${name}`);
    });
  });

  test('the bar is flat: a hairline on top, no floating pill', () => {
    const root = render(buildProps());

    const bar = root
      .findAll((node) => node.props?.style !== undefined)
      .map((node) => StyleSheet.flatten(node.props.style))
      .find((style) => style?.borderTopWidth);

    expect(bar).toBeDefined();
    expect(bar.borderRadius).toBeUndefined();
    expect(bar.backgroundColor).toBe(COLORS.background);
  });

  test('the add action is an ink plate, the same block as the app mark', () => {
    const root = render(buildProps());

    const seal = root
      .findAll((node) => node.props?.style !== undefined)
      .map((node) => StyleSheet.flatten(node.props.style))
      .find((style) => style?.backgroundColor === COLORS.inverse);

    expect(seal).toBeDefined();
    expect(seal.borderRadius).toBe(4);
    expect(root.findAll((node) => node.props?.tone === 'onInverse').length).toBeGreaterThan(0);
  });

  test('accent is not spent on the tab bar', () => {
    const root = render(buildProps());

    const accented = root
      .findAll((node) => node.props?.style !== undefined)
      .map((node) => StyleSheet.flatten(node.props.style))
      .filter((style) => style?.backgroundColor === COLORS.accent);

    expect(accented).toHaveLength(0);
  });

  test('tapping another tab navigates to it', () => {
    const props = buildProps();
    const root = render(props);

    const tabs = root.findAllByType(TouchableOpacity);
    expect(tabs).toHaveLength(4);
    act(() => tabs[1].props.onPress());

    expect(props.navigation.navigate).toHaveBeenCalledWith('stats');
  });
});
