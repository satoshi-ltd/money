export const canOfferBiometrics = ({ biometricAvailable, biometricEnabled = false } = {}) =>
  !!biometricEnabled && biometricAvailable !== false;

// Never widen to 'inactive': iOS reports it while its own biometric sheet is open, which would loop the prompt.
export const isReturningToForeground = (previousState, nextState) =>
  previousState === 'background' && nextState === 'active';

// The development fallback has no prompt to show, so firing it by itself would unlock with nothing asked.
export const shouldAutoPromptBiometrics = ({
  availability,
  biometricEnabled = false,
  biometricInvalidated = false,
  signup = false,
} = {}) =>
  !!biometricEnabled && !biometricInvalidated && !signup && !!availability?.available && !availability?.mocked;

export const resolveBiometricFailure = (code) => {
  if (code === 'ERR_BIOMETRIC_CANCELED') return undefined;
  if (code === 'ERR_BIOMETRIC_INVALIDATED') return 'invalidated';
  if (code === 'ERR_BIOMETRIC_NOT_AVAILABLE' || code === 'ERR_BIOMETRIC_NOT_ENROLLED' || code === 'ERR_BIOMETRIC_WEAK')
    return 'unavailable';

  return 'failed';
};
