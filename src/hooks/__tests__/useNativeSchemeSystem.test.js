import React from 'react';
import { Appearance } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { useNativeScheme } from '../useNativeScheme';

jest.mock('react-native/Libraries/Utilities/NativeAppearance', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn(),
    getColorScheme: jest.fn(() => 'dark'),
    removeListeners: jest.fn(),
    setColorScheme: jest.fn(),
  },
}));

const renderHook = (hook) => {
  const Probe = () => {
    hook();
    return null;
  };
  act(() => {
    TestRenderer.create(<Probe />);
  });
};

describe('hooks/useNativeScheme on the real Appearance', () => {
  test('System gives the scheme back to the phone, so a dark phone reads dark', () => {
    renderHook(() => useNativeScheme('light'));
    expect(Appearance.getColorScheme()).toBe('light');

    renderHook(() => useNativeScheme('system'));

    expect(Appearance.getColorScheme()).toBe('dark');
  });
});
