import { Screen, Setting, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

// import { Setting } from './components/Setting';
import { getLatestRates, verboseDate } from './helpers';
import { ABOUT, OPTIONS, PREFERENCES, REMINDER_BACKUP_OPTIONS } from './Settings.constants';
import { style } from './Settings.style';
import { useStore } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { BackupService, NotificationsService, PurchaseService } from '../../services';
import { DarkTheme, LightTheme } from '../../theme';

const { EVENT, IS_WEB } = C;

const Settings = ({ navigation = {} }) => {
  const store = useStore();

  const [activity, setActivity] = useState();

  const {
    accounts = [],
    importBackup,
    updateSettings,
    updateSubscription,
    updateTheme,
    settings = {},
    subscription,
    txs = [],
  } = store;

  const { baseCurrency, colorCurrency = false, lastRatesUpdate = '', reminders, theme } = settings;

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
    if (exported) eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.CONFIRM_EXPORT_SUCCESS });
  };

  const handleImport = async () => {
    if (!IS_WEB && !isPremium) return handleSubscription('import');

    const backup = await BackupService.import().catch(handleError);

    if (backup) {
      navigation.navigate('confirm', {
        caption: L10N.CONFIRM_IMPORT_CAPTION(backup),
        title: L10N.CONFIRM_IMPORT,
        onAccept: async () => {
          const { settings: { theme } = {} } = backup || {};

          if (theme) updateTheme(theme);
          await importBackup(backup);
          navigation.navigate('dashboard');
          eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.CONFIRM_IMPORT_SUCCESS });
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
      .catch(handleError);
  };

  const handleRestorePurchases = () => {
    setActivity('restore');
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          eventEmitter.emit(EVENT.NOTIFICATION, { message: L10N.PURCHASE_RESTORED });
          setActivity();
        }
      })
      .catch(handleError);
  };

  const handleError = (error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: JSON.stringify(error) });

  const handleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  };

  const handleColorCurrency = () => {
    updateSettings({ colorCurrency: !colorCurrency });
  };

  const handleChangeReminder = (item) => {
    NotificationsService.reminders([item.value]);
    updateSettings({ reminders: [item.value] });
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
        {OPTIONS(isPremium, subscription).map(({ caption, disabled, icon, id, text, ...rest }) => (
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
            onPress={rest.callback ? () => handleOption(rest) : undefined}
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
          onPress={handleColorCurrency}
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
        <Setting
          caption={L10N.REMINDER_BACKUP_CAPTION}
          icon={ICON.BELL}
          onChange={(value = 0) => handleChangeReminder(value)}
          onPress={() => {}}
          options={REMINDER_BACKUP_OPTIONS}
          selected={reminders?.[0] || 1}
          text={L10N.REMINDER_BACKUP}
        />
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
