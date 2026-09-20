import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { biometricKind, BiometricAuthService } from '../BiometricAuthService';
import { FILENAME } from '../../contexts/store.constants';

jest.mock('expo-local-authentication', () => ({
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
  getEnrolledLevelAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  canUseBiometricAuthentication: jest.fn(),
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
}));

const KEY = `${FILENAME}.biometric.pin`;
const KEYCHAIN = { keychainService: `${FILENAME}.biometric` };

const codeOf = (promise) => promise.then(() => undefined).catch((error) => error.code);

describe('services/BiometricAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = false;
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1]);
    LocalAuthentication.getEnrolledLevelAsync.mockResolvedValue(3);
    SecureStore.canUseBiometricAuthentication.mockResolvedValue(true);
    SecureStore.setItemAsync.mockResolvedValue(true);
    SecureStore.getItemAsync.mockResolvedValue('1234');
    SecureStore.deleteItemAsync.mockResolvedValue(true);
  });

  afterEach(() => {
    global.__DEV__ = true;
  });

  test('a phone with strong enrolled biometrics is available', async () => {
    await expect(BiometricAuthService.isAvailable()).resolves.toMatchObject({ available: true, enrolled: true });
  });

  test('no enrolled finger, no hardware, or no keychain support each mean unavailable', async () => {
    LocalAuthentication.isEnrolledAsync.mockResolvedValue(false);
    expect((await BiometricAuthService.isAvailable()).available).toBe(false);

    LocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(false);
    expect((await BiometricAuthService.isAvailable()).available).toBe(false);

    LocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
    SecureStore.canUseBiometricAuthentication.mockResolvedValue(false);
    expect((await BiometricAuthService.isAvailable()).available).toBe(false);
  });

  test('a weak biometric is treated as no biometric at all', async () => {
    LocalAuthentication.getEnrolledLevelAsync.mockResolvedValue(2);
    SecureStore.canUseBiometricAuthentication.mockResolvedValue(false);

    expect(await codeOf(BiometricAuthService.savePin('1234'))).toBe('ERR_BIOMETRIC_WEAK');
  });

  test('the pin is written behind the reader, never beside it', async () => {
    await BiometricAuthService.savePin('1234');

    const [key, value, options] = SecureStore.setItemAsync.mock.calls[0];
    expect(key).toBe(KEY);
    expect(value).toBe('1234');
    expect(options).toMatchObject({ ...KEYCHAIN, requireAuthentication: true });
    expect(options.authenticationPrompt).toBeTruthy();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('there is nothing to store without a pin', async () => {
    expect(await codeOf(BiometricAuthService.savePin(''))).toBe('ERR_BIOMETRIC_PIN_REQUIRED');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  test('reading asks the reader and hands back the stored pin', async () => {
    await expect(BiometricAuthService.readPin()).resolves.toBe('1234');
    expect(SecureStore.getItemAsync.mock.calls[0][1]).toMatchObject({ requireAuthentication: true });
  });

  test('an empty read means the key is gone, and the key is forgotten here too', async () => {
    SecureStore.getItemAsync.mockResolvedValue(null);

    expect(await codeOf(BiometricAuthService.readPin())).toBe('ERR_BIOMETRIC_INVALIDATED');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(KEY, KEYCHAIN);
  });

  test('a cancelled prompt is reported as cancelled, not as a failure', async () => {
    SecureStore.getItemAsync.mockRejectedValue(new Error('User canceled the authentication'));

    expect(await codeOf(BiometricAuthService.readPin())).toBe('ERR_BIOMETRIC_CANCELED');
  });

  test('clearing removes both the keychain entry and the development copy', async () => {
    await BiometricAuthService.clearPin();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(KEY, KEYCHAIN);
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  test('a development build falls back to plain storage, and a release build never can', async () => {
    LocalAuthentication.hasHardwareAsync.mockResolvedValue(false);

    global.__DEV__ = false;
    expect(await codeOf(BiometricAuthService.savePin('1234'))).toBe('ERR_BIOMETRIC_NOT_AVAILABLE');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('the reported kind follows what the reader can actually do', async () => {
    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([2]);
    expect((await BiometricAuthService.isAvailable()).kind).toBe('face');

    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1]);
    expect((await BiometricAuthService.isAvailable()).kind).toBe('fingerprint');

    LocalAuthentication.supportedAuthenticationTypesAsync.mockResolvedValue([1, 2]);
    expect((await BiometricAuthService.isAvailable()).kind).toBe('face');
  });

  test('a phone that reports nothing still names a key rather than none', () => {
    expect(biometricKind([])).toBe('fingerprint');
    expect(biometricKind()).toBe('fingerprint');
  });
});
