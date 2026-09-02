import * as Haptics from 'expo-haptics';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumKeyboard } from './components';
import { getStyles } from './Session.style';
import { Logo, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { NotificationsService, ServiceRates } from '../../services';

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
  const shake = useRef(new Animated.Value(0)).current;

  const signup = settings.pin === undefined;

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
          {signup ? L10N.PIN_CHOOSE : L10N.PIN}
        </Text>
        <Animated.View style={[style.pinCode, { transform: [{ translateX: shake }] }]}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View key={index} style={[style.pin, pin.length > index ? style.pinActive : undefined]} />
          ))}
        </Animated.View>

        <View style={style.spacerMiddle} />

        <NumKeyboard
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
