import * as Haptics from 'expo-haptics';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumKeyboard } from './components';
import {
  canOfferBiometrics,
  isReturningToForeground,
  resolveBiometricFailure,
  shouldAutoPromptBiometrics,
} from './Session.helpers';
import { getStyles } from './Session.style';
import { Logo, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { BiometricAuthService, NotificationsService, ServiceRates } from '../../services';

const { EVENT, VERSION } = C;

const PIN_LENGTH = 4;

const Session = ({ navigation: { reset } = {} }) => {
  const {
    accounts = [],
    rates: storedRates,
    scheduledTxs = [],
    settings = {},
    txs = [],
    updateRates,
    updateSettings,
  } = useStore();
  const { colors } = useApp();
  const style = React.useMemo(() => getStyles(colors), [colors]);

  const [pin, setPin] = useState('');
  const [biometricAutoTriggered, setBiometricAutoTriggered] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState();
  const [biometricKind, setBiometricKind] = useState();
  const [biometricInvalidated, setBiometricInvalidated] = useState(false);
  const [biometricSubmitting, setBiometricSubmitting] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const appStateRef = useRef(AppState.currentState);

  const signup = settings.pin === undefined;
  const biometricEnabled = !signup && !!settings.biometricUnlockEnabled;
  const biometricOffered = canOfferBiometrics({ biometricAvailable, biometricEnabled });

  useEffect(() => {
    accounts.length === 0 && fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRates = async () => {
    const rates = await ServiceRates.get({ ...settings, known: storedRates })['catch'](() => {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES });
    });
    if (rates) updateRates(rates);
  };

  useEffect(() => {
    if (pin.length < PIN_LENGTH) return;

    if (pin.length === PIN_LENGTH && (signup || settings.pin === pin)) handleSubmit();
    else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence(
        [12, -12, 8, -8, 0].map((toValue) =>
          Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true }),
        ),
      ).start();
      setPin('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const forgetBiometrics = async () => {
    setBiometricInvalidated(true);
    await BiometricAuthService.clearPin()['catch'](() => {});
    await updateSettings({ biometricUnlockEnabled: false });
  };

  const handleBiometricUnlock = async ({ silent } = {}) => {
    setBiometricSubmitting(true);
    try {
      const stored = await BiometricAuthService.readPin();

      // The keychain outlived the PIN it stands for: treat it as gone rather than let a stale one in.
      if (stored !== settings.pin) {
        await forgetBiometrics();
        if (!silent) eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.BIOMETRIC_UNLOCK_INVALIDATED });
        return false;
      }

      await handleSubmit();
      return true;
    } catch (error) {
      const failure = resolveBiometricFailure(error?.code);

      if (failure === 'invalidated') {
        await forgetBiometrics();
        if (!silent) eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.BIOMETRIC_UNLOCK_INVALIDATED });
        return false;
      }

      if (failure === 'unavailable') setBiometricAvailable(false);
      if (failure && !silent)
        eventEmitter.emit(EVENT.NOTIFICATION, {
          error: true,
          title: failure === 'unavailable' ? L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE : L10N.ERROR_TRY_AGAIN,
        });

      return false;
    } finally {
      setBiometricSubmitting(false);
    }
  };

  // Coming back from the background re-arms the prompt: the reader is here again, and the sheet is gone.
  useEffect(() => {
    if (!biometricEnabled) return undefined;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (isReturningToForeground(previousState, nextState)) setBiometricAutoTriggered(false);
    });

    return () => subscription.remove();
  }, [biometricEnabled]);

  useEffect(() => {
    if (!biometricEnabled || biometricAutoTriggered || biometricSubmitting) return undefined;

    let active = true;

    const autoPrompt = async () => {
      const availability = await BiometricAuthService.isAvailable()['catch'](() => undefined);
      if (!active) return;

      setBiometricAutoTriggered(true);
      setBiometricAvailable(!!availability?.available);
      setBiometricKind(availability?.kind);

      if (shouldAutoPromptBiometrics({ availability, biometricEnabled, biometricInvalidated, signup })) {
        await handleBiometricUnlock({ silent: true });
      }
    };

    autoPrompt();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricAutoTriggered, biometricEnabled, biometricInvalidated, biometricSubmitting, signup]);

  const handleSubmit = async () => {
    if (signup) await updateSettings({ pin });
    await NotificationsService.init({ reminders: settings.reminders, scheduledTxs, txs });

    reset({ index: 0, routes: [{ name: 'main' }] });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={style.safeAreaView}>
      <View style={style.content}>
        <View style={style.spacerTop} />
        <Logo size={24} />
        <Text size="s" tone="muted" style={style.caption}>
          {biometricInvalidated ? L10N.BIOMETRIC_UNLOCK_INVALIDATED : signup ? L10N.PIN_CHOOSE : L10N.PIN}
        </Text>
        <Animated.View style={[style.pinCode, { transform: [{ translateX: shake }] }]}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View key={index} style={[style.pin, pin.length > index ? style.pinActive : undefined]} />
          ))}
        </Animated.View>

        <View style={style.spacerMiddle} />

        <NumKeyboard
          biometricIcon={biometricKind === 'face' ? ICON.BIOMETRIC_FACE : ICON.BIOMETRIC}
          onBiometric={
            biometricOffered && !biometricSubmitting ? () => handleBiometricUnlock({ silent: false }) : undefined
          }
          onDelete={() => setPin((current) => current.slice(0, -1))}
          onPress={(number) => setPin(`${pin}${number}`)}
        />

        <Text size="xxs" tone="muted" style={style.version}>{`m\u00F4ney v${VERSION}`}</Text>
      </View>
    </SafeAreaView>
  );
};

Session.propTypes = {
  navigation: PropTypes.any,
};

export { Session };
