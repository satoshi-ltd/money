import { Screen, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { Setting } from './components/Setting';
import { getLatestRates, verboseDate } from './helpers';
import { ABOUT, OPTIONS, PREFERENCES } from './Settings.constants';
import { style } from './Settings.style';
import { useStore } from '../../contexts';
import { C, ICON, L10N } from '../../modules';
import { BackupService, PurchaseService } from '../../services';
import { DarkTheme, LightTheme } from '../../theme';

const { IS_WEB } = C;

const Settings = ({ navigation = {} }) => {
  const store = useStore();

  const [activity, setActivity] = useState();

  const {
    accounts = [],
    importBackup,
    updateSettings,
    updateSubscription,
    settings = {},
    subscription,
    txs = [],
  } = store;

  const { baseCurrency, colorCurrency = false, lastRatesUpdate = '', theme } = settings;

  const isPremium = !!subscription?.productIdentifier;

  const handleUpdateRates = async () => {
    setActivity({ ...activity, updateRates: true });
    await getLatestRates({ store });
    setActivity({ updateRates: false });
  };

  const handleOption = ({ callback, screen, url }) => {
    if (url) Linking.openURL(url);
    if (screen) navigation.navigate(screen);
    else if (callback === 'handleSubscription') handleSubscription();
    else if (callback === 'handleExport') handleExport();
    else if (callback === 'handleImport') handleImport();
    else if (callback === 'handleUpdateRates') handleUpdateRates();
    else if (callback === 'handleRestorePurchases') handleRestorePurchases();
  };

  const handleExport = async () => {
    if (!IS_WEB && !isPremium) return handleSubscription('export');

    const exported = await BackupService.export({ accounts, settings, txs });
    if (exported) alert(L10N.CONFIRM_EXPORT_SUCCESS);
  };

  const handleImport = async () => {
    if (!IS_WEB && !isPremium) return handleSubscription('import');

    const backup = await BackupService.import().catch((error) => alert(error));

    if (backup) {
      navigation.navigate('confirm', {
        caption: L10N.CONFIRM_IMPORT_CAPTION(backup),
        title: L10N.CONFIRM_IMPORT,
        onAccept: async () => {
          await importBackup(backup);
          navigation.navigate('dashboard');
          alert(L10N.CONFIRM_IMPORT_SUCCESS);
        },
      });
    }
  };

  const handleSubscription = (activityState) => {
    if (subscription?.productIdentifier) navigation.navigate('subscription');
    setActivity(activityState);
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
        setActivity();
      })
      .catch((error) => alert(error));
  };

  const handleRestorePurchases = () => {
    setActivity('restore');
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          alert(L10N.PURCHASE_RESTORED);
          setActivity();
        }
      })
      .catch((error) => alert(error));
  };

  const handleTheme = () => {
    StyleSheet.build(StyleSheet.value('$theme') === 'light' ? DarkTheme : LightTheme);
    updateSettings({ theme: StyleSheet.value('$theme') });
  };

  const handlecolorCurrency = () => {
    updateSettings({ colorCurrency: !colorCurrency });
  };

  return (
    <Screen gap offset style={style.screen}>
      <Text bold secondary subtitle>
        {L10N.SETTINGS}
      </Text>

      <View style={style.group}>
        <Text bold caption>
          {L10N.GENERAL.toUpperCase()}
        </Text>
        {OPTIONS.map(({ caption, disabled, icon, id, text, ...rest }) => (
          <Setting
            activity={rest.callback && [rest.callback].sync}
            key={`option-${id}`}
            {...{
              activity: rest.callback === 'handleUpdateRates' && activity?.updateRates,
              caption:
                rest.callback === 'handleUpdateRates'
                  ? `${L10N.SYNC_RATES_SENTENCE} ${verboseDate(new Date(lastRatesUpdate), {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : caption,
              disabled,
              icon,
              text,
            }}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold caption>
          {L10N.PREFERENCES.toUpperCase()}
        </Text>
        <Setting
          icon={ICON.THEME}
          text={theme === 'dark' ? L10N.APPERANCE_LIGHT : L10N.APPERANCE_DARK}
          onPress={handleTheme}
        />
        <Setting
          icon={ICON.COLOR_FILL}
          text={colorCurrency ? L10N.CURRENCY_COLOR_DISABLE : L10N.CURRENCY_COLOR_ENABLE}
          onPress={handlecolorCurrency}
        />
        {PREFERENCES.map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            caption={rest.screen === 'baseCurrency' ? L10N.CURRENCY_NAME[baseCurrency] : undefined}
            activity={activity && activity[rest.callback]}
            key={`preference-${index}`}
            {...{ disabled, icon, text }}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold caption>
          {L10N.ABOUT.toUpperCase()}
        </Text>
        {ABOUT(isPremium).map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            activity={activity && activity[rest.callback]}
            key={`about-${index}`}
            {...{ disabled, icon, text }}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>
    </Screen>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
