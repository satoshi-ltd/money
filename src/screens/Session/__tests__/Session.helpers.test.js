import {
  canOfferBiometrics,
  isReturningToForeground,
  resolveBiometricFailure,
  shouldAutoPromptBiometrics,
} from '../Session.helpers';

describe('screens/Session/helpers', () => {
  test('the key is offered while the setting is on and the reader has not said no', () => {
    expect(canOfferBiometrics({ biometricEnabled: true, biometricAvailable: true })).toBe(true);
    expect(canOfferBiometrics({ biometricEnabled: true, biometricAvailable: undefined })).toBe(true);
    expect(canOfferBiometrics({ biometricEnabled: true, biometricAvailable: false })).toBe(false);
    expect(canOfferBiometrics({ biometricEnabled: false, biometricAvailable: true })).toBe(false);
    expect(canOfferBiometrics()).toBe(false);
  });

  test('only a real return from the background re-arms the prompt', () => {
    expect(isReturningToForeground('background', 'active')).toBe(true);
    expect(isReturningToForeground('inactive', 'active')).toBe(false);
    expect(isReturningToForeground('active', 'inactive')).toBe(false);
    expect(isReturningToForeground('background', 'inactive')).toBe(false);
  });

  test('the prompt opens by itself only for a phone that can answer it', () => {
    const base = { availability: { available: true }, biometricEnabled: true };

    expect(shouldAutoPromptBiometrics(base)).toBe(true);
    expect(shouldAutoPromptBiometrics({ ...base, availability: { available: false } })).toBe(false);
    expect(shouldAutoPromptBiometrics({ ...base, availability: undefined })).toBe(false);
    expect(shouldAutoPromptBiometrics({ ...base, biometricEnabled: false })).toBe(false);
    expect(shouldAutoPromptBiometrics({ ...base, biometricInvalidated: true })).toBe(false);
    expect(shouldAutoPromptBiometrics()).toBe(false);
  });

  test('the prompt never opens while the reader is choosing their first pin', () => {
    expect(shouldAutoPromptBiometrics({ availability: { available: true }, biometricEnabled: true, signup: true })).toBe(
      false,
    );
  });

  test('a cancelled prompt is silent, and every other failure is named', () => {
    expect(resolveBiometricFailure('ERR_BIOMETRIC_CANCELED')).toBeUndefined();
    expect(resolveBiometricFailure('ERR_BIOMETRIC_INVALIDATED')).toBe('invalidated');
    expect(resolveBiometricFailure('ERR_BIOMETRIC_NOT_AVAILABLE')).toBe('unavailable');
    expect(resolveBiometricFailure('ERR_BIOMETRIC_NOT_ENROLLED')).toBe('unavailable');
    expect(resolveBiometricFailure('ERR_BIOMETRIC_WEAK')).toBe('unavailable');
    expect(resolveBiometricFailure('ERR_SOMETHING_ELSE')).toBe('failed');
    expect(resolveBiometricFailure()).toBe('failed');
  });

  test('a mocked reader never unlocks by itself, it waits for the key', () => {
    expect(
      shouldAutoPromptBiometrics({ availability: { available: true, mocked: true }, biometricEnabled: true }),
    ).toBe(false);
  });
});
