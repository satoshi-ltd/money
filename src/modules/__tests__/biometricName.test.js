import { biometricName } from '../biometricName';
import { L10N } from '../l10n';

describe('biometricName', () => {
  test('an iPhone is told the name Apple gave its own reader', () => {
    expect(biometricName('face', 'ios')).toBe(L10N.BIOMETRIC_UNLOCK_FACE_ID);
    expect(biometricName('fingerprint', 'ios')).toBe(L10N.BIOMETRIC_UNLOCK_TOUCH_ID);
  });

  test('an Android phone is told what it reads, not a brand it does not carry', () => {
    expect(biometricName('face', 'android')).toBe(L10N.BIOMETRIC_UNLOCK_FACE);
    expect(biometricName('fingerprint', 'android')).toBe(L10N.BIOMETRIC_UNLOCK);
  });

  test('the four names are four different sentences', () => {
    const names = [
      biometricName('face', 'ios'),
      biometricName('fingerprint', 'ios'),
      biometricName('face', 'android'),
      biometricName('fingerprint', 'android'),
    ];

    expect(new Set(names).size).toBe(4);
    names.forEach((name) => expect(name).toBeTruthy());
  });

  // An unknown reader still has to say something, and a finger is the safer guess.
  test('a phone that reports no kind falls back to the finger', () => {
    expect(biometricName(undefined, 'android')).toBe(L10N.BIOMETRIC_UNLOCK);
    expect(biometricName(undefined, 'ios')).toBe(L10N.BIOMETRIC_UNLOCK_TOUCH_ID);
  });
});
