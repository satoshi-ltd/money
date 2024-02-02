import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { changeBaseCurrency, getLatestRates } from './helpers';
import { Backup } from './Settings.Backup';
import { style } from './Settings.style';
import { Action, Button, Card, Screen, Text, View } from '../../../__design-system__';
import { Heading, SliderCurrencies } from '../../../components';
import { useStore } from '../../../contexts';
import { C, L10N } from '../../../modules';
import { DarkTheme, LightTheme } from '../../../theme';

const { IS_DEV } = C;

const Settings = ({ navigation = {} }) => {
  const store = useStore();

  const {
    updateSettings,
    settings: { baseCurrency, lastRatesUpdate = '', theme },
  } = store;

  const [busy, setBusy] = useState(false);

  const handleChangeCurrency = async (currency) => {
    setBusy(true);
    await changeBaseCurrency({ currency, L10N, store });
    setBusy(false);
  };

  const handleUpdateRates = async () => {
    setBusy(true);
    await getLatestRates({ store });
    setBusy(false);
  };

  const handleResetData = async () => {
    await store.importBackup();
    navigation.navigate('session');
  };

  const toggleTheme = () => {
    StyleSheet.build(StyleSheet.value('$theme') === 'light' ? DarkTheme : LightTheme);
    updateSettings({ theme: StyleSheet.value('$theme') });
  };

  return (
    <Screen gap>
      {IS_DEV && (
        <Card style={style.offset}>
          <Text bold>Developer Mode</Text>
          <Button onPress={handleResetData}>Reset all data</Button>
        </Card>
      )}

      <Card style={style.offset}>
        <View row spaceBetween>
          <Text bold>{L10N.DARK_MODE}</Text>
          <Button small onPress={toggleTheme}>
            {theme === 'dark' ? L10N.DISABLE : L10N.ENABLE}
          </Button>
        </View>
      </Card>

      <Backup navigation={navigation} style={style.offset} />

      <View>
        <Heading value={L10N.CHOOSE_CURRENCY}>
          <Action activity={busy} caption disabled={busy} onPress={handleUpdateRates}>
            {L10N.SYNC_RATES_CTA}
          </Action>
        </Heading>

        <SliderCurrencies selected={baseCurrency} onChange={handleChangeCurrency} style={style.slider} />

        <Text color="contentLight" caption style={[style.hint, style.offset]}>
          {!busy
            ? `${L10N.SYNC_RATES_SENTENCE} ${lastRatesUpdate.toString().split(' ').slice(0, 5).join(' ')}`
            : L10N.WAIT}
        </Text>
      </View>
    </Screen>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
