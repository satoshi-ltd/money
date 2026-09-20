import { Platform } from 'react-native';

import { L10N } from './l10n';

// Apple sells the reader by name, so a phone that says Face ID must not be told to press a finger.
export const biometricName = (kind, os = Platform.OS) => {
  if (os === 'ios') return kind === 'face' ? L10N.BIOMETRIC_UNLOCK_FACE_ID : L10N.BIOMETRIC_UNLOCK_TOUCH_ID;

  return kind === 'face' ? L10N.BIOMETRIC_UNLOCK_FACE : L10N.BIOMETRIC_UNLOCK;
};
