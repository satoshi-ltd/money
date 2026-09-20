import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { L10N } from '../modules';
import { FILENAME } from '../contexts/store.constants';

const BIOMETRIC_KEY = `${FILENAME}.biometric.pin`;
const BIOMETRIC_SERVICE = `${FILENAME}.biometric`;
const BIOMETRIC_DEV_KEY = `${FILENAME}.biometric.dev-pin`;
// Read at call time, not at import: a constant here freezes whatever __DEV__ was when the bundle loaded.
const isDevMode = () => typeof __DEV__ !== 'undefined' && __DEV__;

export const biometricKind = (supportedTypes = []) =>
  supportedTypes.includes(LocalAuthentication.AuthenticationType?.FACIAL_RECOGNITION ?? 2) ? 'face' : 'fingerprint';

const createError = (code) => {
  const error = new Error(code);
  error.code = code;

  return error;
};

const normalizeBiometricError = (error) => {
  if (error?.code) return error;

  const message = `${error?.message || ''}`.toLowerCase();
  if (message.includes('cancel')) return createError('ERR_BIOMETRIC_CANCELED');
  if (message.includes('not available')) return createError('ERR_BIOMETRIC_NOT_AVAILABLE');
  if (message.includes('not enrolled')) return createError('ERR_BIOMETRIC_NOT_ENROLLED');

  return createError('ERR_BIOMETRIC_FAILED');
};

const getAvailability = async () => {
  if (Platform.OS === 'web') return { available: false, enrolled: false, hasHardware: false, supportedTypes: [] };

  const [hasHardware, enrolled, supportedTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  const securityLevel = LocalAuthentication.getEnrolledLevelAsync
    ? await LocalAuthentication.getEnrolledLevelAsync()
    : LocalAuthentication.SecurityLevel?.NONE || 0;
  const strongLevel = LocalAuthentication.SecurityLevel?.BIOMETRIC_STRONG;
  const strongBiometrics = strongLevel ? securityLevel >= strongLevel : supportedTypes.length > 0;
  // A weak biometric cannot gate the keychain, so the PIN would sit there readable: treat it as no biometrics at all.
  const secureStoreSupported = SecureStore.canUseBiometricAuthentication
    ? await SecureStore.canUseBiometricAuthentication()
    : strongBiometrics;
  const available = hasHardware && enrolled && supportedTypes.length > 0 && strongBiometrics && secureStoreSupported;
  const availability = {
    enrolled,
    hasHardware,
    kind: biometricKind(supportedTypes),
    secureStoreSupported,
    securityLevel,
    strongBiometrics,
    supportedTypes,
  };

  if (available || !isDevMode()) return { ...availability, available };

  // Simulators and most emulators report no strong hardware; __DEV__ is stripped from the release bundle.
  return { ...availability, available: true, mocked: true };
};

const ensureAvailability = async () => {
  const availability = await getAvailability();
  if (availability.available) return availability;

  if (!availability.hasHardware) throw createError('ERR_BIOMETRIC_NOT_AVAILABLE');
  if (!availability.enrolled) throw createError('ERR_BIOMETRIC_NOT_ENROLLED');
  if (!availability.strongBiometrics || !availability.secureStoreSupported) throw createError('ERR_BIOMETRIC_WEAK');

  throw createError('ERR_BIOMETRIC_NOT_AVAILABLE');
};

const secureStoreOptions = (authenticationPrompt) => ({
  authenticationPrompt,
  keychainService: BIOMETRIC_SERVICE,
  requireAuthentication: true,
});

const savePin = async (pin = '') => {
  if (!pin) throw createError('ERR_BIOMETRIC_PIN_REQUIRED');

  const availability = await ensureAvailability();

  if (isDevMode() && availability.mocked) {
    await AsyncStorage.setItem(BIOMETRIC_DEV_KEY, pin);
    return true;
  }

  await SecureStore.setItemAsync(BIOMETRIC_KEY, pin, secureStoreOptions(L10N.BIOMETRIC_PROMPT_ENABLE));

  return true;
};

const readPin = async () => {
  const availability = await ensureAvailability();

  try {
    if (isDevMode() && availability.mocked) {
      const pin = await AsyncStorage.getItem(BIOMETRIC_DEV_KEY);
      if (pin) return pin;

      throw createError('ERR_BIOMETRIC_INVALIDATED');
    }

    const pin = await SecureStore.getItemAsync(BIOMETRIC_KEY, secureStoreOptions(L10N.BIOMETRIC_PROMPT_UNLOCK));
    if (pin) return pin;

    // Enrolling a new finger drops the keychain entry: forget it here too, or the prompt returns nothing forever.
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY, { keychainService: BIOMETRIC_SERVICE });
    throw createError('ERR_BIOMETRIC_INVALIDATED');
  } catch (error) {
    throw normalizeBiometricError(error);
  }
};

const clearPin = async () => {
  await AsyncStorage.removeItem(BIOMETRIC_DEV_KEY);
  if (Platform.OS === 'web') return false;

  await SecureStore.deleteItemAsync(BIOMETRIC_KEY, { keychainService: BIOMETRIC_SERVICE });

  return true;
};

export const BiometricAuthService = { clearPin, isAvailable: getAvailability, readPin, savePin };
