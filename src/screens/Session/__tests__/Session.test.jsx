import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Session } from '../Session';
import { ICON } from '../../../modules';
import { BiometricAuthService } from '../../../services';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Error: 'error' },
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { SafeAreaView: (props) => MockReact.createElement(ReactNative.View, props) };
});

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useStore: () => mockStore,
}));

jest.mock('../../../services', () => ({
  BiometricAuthService: {
    clearPin: jest.fn(() => Promise.resolve(true)),
    isAvailable: jest.fn(() => Promise.resolve({ available: true })),
    readPin: jest.fn(() => Promise.resolve('1234')),
  },
  NotificationsService: { init: jest.fn(() => Promise.resolve()) },
  ServiceRates: { get: jest.fn(() => Promise.resolve({})) },
}));

jest.mock('../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    NumKeyboard: (props) => MockReact.createElement(ReactNative.View, { testID: 'keyboard', ...props }),
  };
});

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    Logo: (props) => MockReact.createElement(ReactNative.View, props),
    Text: ({ figure, medium, size, tone, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const reset = jest.fn();

const render = async () => {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(<Session navigation={{ reset }} />);
  });
  return renderer.root;
};

const keyboard = (root) => root.findAllByProps({ testID: 'keyboard' }).find((node) => typeof node.type === 'function');

describe('screens/Session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    BiometricAuthService.isAvailable.mockResolvedValue({ available: true });
    BiometricAuthService.readPin.mockResolvedValue('1234');
    mockStore = {
      accounts: [{ hash: 'a1' }],
      scheduledTxs: [],
      settings: { biometricUnlockEnabled: true, pin: '1234', reminders: [1] },
      txs: [],
      updateRates: jest.fn(),
      updateSettings: jest.fn(),
    };
  });

  test('with the setting on, the reader is asked on arrival and the ledger opens', async () => {
    await render();

    expect(BiometricAuthService.readPin).toHaveBeenCalled();
    expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'main' }] });
  });

  test('with the setting off, nothing is asked and the pin is the only way in', async () => {
    mockStore.settings = { ...mockStore.settings, biometricUnlockEnabled: false };

    const root = await render();

    expect(BiometricAuthService.readPin).not.toHaveBeenCalled();
    expect(reset).not.toHaveBeenCalled();
    expect(keyboard(root).props.onBiometric).toBeUndefined();
  });

  test('while choosing a first pin the reader is never asked', async () => {
    mockStore.settings = { biometricUnlockEnabled: true, pin: undefined, reminders: [1] };

    await render();

    expect(BiometricAuthService.readPin).not.toHaveBeenCalled();
  });

  test('a keychain holding a pin that is no longer the pin forgets itself instead of letting anyone in', async () => {
    BiometricAuthService.readPin.mockResolvedValue('9999');

    await render();

    expect(reset).not.toHaveBeenCalled();
    expect(BiometricAuthService.clearPin).toHaveBeenCalled();
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ biometricUnlockEnabled: false });
  });

  test('a cancelled prompt leaves the keypad, the setting and the stored pin alone', async () => {
    const error = new Error('ERR_BIOMETRIC_CANCELED');
    error.code = 'ERR_BIOMETRIC_CANCELED';
    BiometricAuthService.readPin.mockRejectedValue(error);

    const root = await render();

    expect(reset).not.toHaveBeenCalled();
    expect(BiometricAuthService.clearPin).not.toHaveBeenCalled();
    expect(mockStore.updateSettings).not.toHaveBeenCalled();
    expect(keyboard(root).props.onBiometric).toEqual(expect.any(Function));
  });

  test('a phone whose reader is gone drops the key rather than offering one that cannot work', async () => {
    BiometricAuthService.isAvailable.mockResolvedValue({ available: false });

    const root = await render();

    expect(BiometricAuthService.readPin).not.toHaveBeenCalled();
    expect(keyboard(root).props.onBiometric).toBeUndefined();
  });

  test('the key can be pressed again after a cancelled prompt', async () => {
    const error = new Error('ERR_BIOMETRIC_CANCELED');
    error.code = 'ERR_BIOMETRIC_CANCELED';
    BiometricAuthService.readPin.mockRejectedValueOnce(error);

    const root = await render();
    await act(async () => keyboard(root).props.onBiometric());

    expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'main' }] });
  });

  test('the key wears the reader the phone has: a face, not a finger', async () => {
    BiometricAuthService.isAvailable.mockResolvedValue({ available: true, kind: 'face' });
    BiometricAuthService.readPin.mockRejectedValue(Object.assign(new Error('x'), { code: 'ERR_BIOMETRIC_CANCELED' }));

    const root = await render();

    expect(keyboard(root).props.biometricIcon).toBe(ICON.BIOMETRIC_FACE);
  });

  test('a fingerprint phone keeps the fingerprint key', async () => {
    BiometricAuthService.isAvailable.mockResolvedValue({ available: true, kind: 'fingerprint' });
    BiometricAuthService.readPin.mockRejectedValue(Object.assign(new Error('x'), { code: 'ERR_BIOMETRIC_CANCELED' }));

    const root = await render();

    expect(keyboard(root).props.biometricIcon).toBe(ICON.BIOMETRIC);
  });

  test('a development phone without a real reader waits to be asked, and shows the key to ask with', async () => {
    BiometricAuthService.isAvailable.mockResolvedValue({ available: true, mocked: true, kind: 'fingerprint' });

    const root = await render();

    expect(BiometricAuthService.readPin).not.toHaveBeenCalled();
    expect(keyboard(root).props.onBiometric).toEqual(expect.any(Function));

    await act(async () => keyboard(root).props.onBiometric());

    expect(reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'main' }] });
  });
});
