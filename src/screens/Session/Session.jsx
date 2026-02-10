import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NumKeyboard } from './components';
import { getStyles } from './Session.style';
import { Logo, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import { C, eventEmitter, L10N } from '../../modules';
import { NotificationsService, ServiceRates } from '../../services';

const { EVENT, VERSION } = C;

const Session = ({ navigation: { reset } = {} }) => {
  const { accounts = [], scheduledTxs = [], settings = {}, txs = [], updateRates, updateSettings } = useStore();
  const { colors } = useApp();
  const style = React.useMemo(() => getStyles(colors), [colors]);

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
    await NotificationsService.init({ reminders: settings.reminders, scheduledTxs, txs });

    reset({ index: 0, routes: [{ name: 'main' }] });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={style.safeAreaView}>
      <View style={style.content}>
        <Logo />
        <Text size="m">{signup ? L10N.PIN_CHOOSE : L10N.PIN}</Text>
        <View style={style.pinCode}>
          {['•', '•', '•', '•'].map((letter, index) => (
            <View key={index} style={[style.pin, pin.length > index ? style.pinActive : undefined]} />
          ))}
        </View>

        <NumKeyboard onPress={(number) => setPin(`${pin}${number}`)} />

        <Text size="xs">{`v${VERSION}`}</Text>
      </View>
    </SafeAreaView>
  );
};

Session.propTypes = {
  navigation: PropTypes.any,
};

export { Session };
