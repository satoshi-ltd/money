import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Tabs } from '../App.Navigator';
import { useRail } from '../hooks';

let mockWindow = { height: 844, width: 390 };
let mockNavigate = jest.fn();
let mockNavigator = {};
let mockChild = null;

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockWindow,
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 24 }) }));
jest.mock('@react-navigation/native', () => ({ NavigationContainer: ({ children }) => children }));
jest.mock('@react-navigation/native-stack', () => ({ createNativeStackNavigator: () => ({ Navigator: () => null, Screen: () => null }) }));
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: (props) => {
      mockNavigator = props;
      return mockChild;
    },
    Screen: () => null,
  }),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('../contexts', () => ({
  useApp: () => ({ colors: { background: '#F6F4EE', text: '#15140F' }, theme: 'light' }),
  useStore: () => ({ settings: {} }),
}));
jest.mock('../screens', () => new Proxy({}, { get: () => () => null }));
jest.mock('../components', () => ({
  Footer: () => 'footer',
  Logo: () => null,
  Rail: () => 'rail',
  Text: ({ children }) => children,
}));

const mountAt = (width) => {
  mockWindow = { height: 844, width };
  mockNavigate = jest.fn();
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Tabs navigation={{ navigate: mockNavigate }} />);
  });
  return renderer;
};

const screenOptions = () => mockNavigator.screenOptions;
const bar = (props = {}) => mockNavigator.tabBar({ state: { index: 0, routes: [] }, ...props });

describe('App.Navigator Tabs', () => {
  test('on a phone the tabs sit in the bottom bar', () => {
    mountAt(390);

    expect(screenOptions().tabBarPosition).toBe('bottom');
    expect(bar().type().toString()).toBe('footer');
  });

  test('on the open Fold the tabs move to a rail on the left and the bar is gone', () => {
    mountAt(790);

    expect(screenOptions().tabBarPosition).toBe('left');
    expect(bar().type().toString()).toBe('rail');
  });

  test('the line is 600 points, and it follows the window when the device folds', () => {
    mountAt(599);
    expect(screenOptions().tabBarPosition).toBe('bottom');
    mountAt(600);
    expect(screenOptions().tabBarPosition).toBe('left');
  });

  test('folding re-renders the same tree: the bar and the rail swap and the position follows, live', () => {
    const renderer = mountAt(411);
    expect(screenOptions().tabBarPosition).toBe('bottom');

    mockWindow = { height: 840, width: 790 };
    act(() => renderer.update(<Tabs navigation={{ navigate: mockNavigate }} />));
    expect(screenOptions().tabBarPosition).toBe('left');
    expect(bar().type().toString()).toBe('rail');

    mockWindow = { height: 844, width: 411 };
    act(() => renderer.update(<Tabs navigation={{ navigate: mockNavigate }} />));
    expect(screenOptions().tabBarPosition).toBe('bottom');
    expect(bar().type().toString()).toBe('footer');
  });

  test('New in either bar opens a new expense', () => {
    [390, 790].forEach((width) => {
      mountAt(width);
      bar().props.onActionPress();

      expect(mockNavigate).toHaveBeenCalledWith('transaction', { type: 0 });
    });
  });

  test('the scenes keep the status bar clear and, beside the rail only, the home indicator too', () => {
    mountAt(390);
    expect(screenOptions().sceneStyle).toMatchObject({ paddingBottom: 0, paddingTop: 24 });
    mountAt(790);
    expect(screenOptions().sceneStyle).toMatchObject({ paddingBottom: 34, paddingTop: 24 });
  });

  test('the screens know they sit beside the rail, and on a phone they do not', () => {
    let beside;
    const Probe = () => {
      beside = useRail();
      return null;
    };
    mockChild = <Probe />;

    mountAt(790);
    expect(beside).toBe(true);
    mountAt(390);
    expect(beside).toBe(false);
  });
});
