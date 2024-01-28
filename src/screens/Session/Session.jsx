import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';

import { NumKeyboard } from './components';
import { style } from './Session.style';
import { Text, View } from '../../__design-system__';
import { Logo } from '../../components';
import { useStore } from '../../contexts';
import { C, L10N } from '../../modules';
import { BackupService, ServiceRates } from '../../services';

const { VERSION } = C;

const Session = ({ navigation: { navigate } = {} }) => {
  const { settings = {}, updateRates, updateSettings, vaults = [] } = useStore();

  const [pin, setPin] = useState('');

  const signup = settings.pin === undefined;

  useEffect(() => {
    vaults.length === 0 && fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRates = async () => {
    const rates = await ServiceRates.get(settings)['catch'](() => alert(L10N.ERROR_SERVICE_RATES));
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
    await BackupService.scheduleNotification();

    navigate('main', { firstVault: vaults.length === 0 });
  };

  return (
    <SafeAreaView style={style.safeAreaView}>
      <View style={style.content}>
        <Logo />
        <Text detail>{signup ? L10N.PIN_CHOOSE : L10N.PIN}</Text>
        <View style={style.pinCode}>
          {['•', '•', '•', '•'].map((letter, index) => (
            <View key={index} style={[style.pin, pin.length > index && style.pinActive]} />
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
