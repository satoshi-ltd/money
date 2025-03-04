import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';

import { NumKeyboard } from './components';
import { style } from './Session.style';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { NotificationsService, ServiceRates } from '../../services';

const { EVENT, VERSION } = C;

const Session = ({ navigation: { reset } = {} }) => {
  const { accounts = [], settings = {}, updateRates, updateSettings } = useStore();

  const [pin, setPin] = useState('');

  const signup = settings.pin === undefined;

  useEffect(() => {
    accounts.length === 0 && fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRates = async () => {
    const rates = await ServiceRates.get(settings)['catch'](() =>
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES }),
    );
    if (rates) updateRates(rates);
  };

  useEffect(() => {
    if (pin.length < 4) return;

    if (pin.length === 4 && (signup || settings.pin === pin)) handleSubmit();
    else setPin('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleSubmit = async () => {
    if (signup) await updateSettings({ pin });
    NotificationsService.init();

    reset({ index: 0, routes: [{ name: 'main' }] });
  };

  const { baseCurrency, colorCurrency = false } = settings;
  const color = colorCurrency ? C.COLOR[baseCurrency] : undefined;

  return (
    <SafeAreaView style={style.safeAreaView}>
      <View style={style.content}>
        <Logo />
        <Text detail>{signup ? L10N.PIN_CHOOSE : L10N.PIN}</Text>
        <View style={style.pinCode}>
          {['•', '•', '•', '•'].map((letter, index) => (
            <View
              key={index}
              style={[
                style.pin,
                pin.length > index ? (color ? { backgroundColor: color } : style.pinActive) : undefined,
              ]}
            />
          ))}
        </View>

        <NumKeyboard onPress={(number) => setPin(`${pin}${number}`)} />

        <Text tiny>{`v${VERSION}`}</Text>
      </View>
    </SafeAreaView>
  );
};

Session.propTypes = {
  navigation: PropTypes.any,
};

export { Session };
