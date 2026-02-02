import { Heading, Screen, Setting, Text, View } from '../../components';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';

import { getLatestRates } from './helpers';
import { ABOUT, OPTIONS, PREFERENCES, REMINDER_BACKUP_OPTIONS } from './Settings.constants';
import { style } from './Settings.style';
import { useStore } from '../../contexts';
import { verboseDate } from '../../modules';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { BackupService, NotificationsService, PurchaseService } from '../../services';

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

  const { baseCurrency, lastRatesUpdate = '', reminders, theme } = settings;

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
    if (exported) eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_EXPORT_SUCCESS });
  };

  const handleImport = async () => {
    if (!IS_WEB && !isPremium) return handleSubscription('import');

    const backup = await BackupService.import().catch(handleError);

    if (backup) {
      Alert.alert(L10N.CONFIRM_IMPORT, L10N.CONFIRM_IMPORT_CAPTION(backup), [
        { text: L10N.CANCEL, style: 'cancel' },
        {
          text: L10N.ACCEPT,
          onPress: async () => {
            const { settings: { theme } = {} } = backup || {};

            if (theme) updateTheme(theme);
            await importBackup(backup);
            navigation.navigate('dashboard');
            eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_IMPORT_SUCCESS });
          },
        },
      ]);
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
          eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.PURCHASE_RESTORED });
          setActivity();
        }
      })
      .catch(handleError);
  };

  const handleError = (error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: JSON.stringify(error) });

  const handleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  };

  const handleChangeReminder = (item) => {
    NotificationsService.reminders([item.value]);
    updateSettings({ reminders: [item.value] });
  };

  const settingProps = {};

  return (
    <Screen gap offset style={style.screen}>
      <Heading value={L10N.SETTINGS} />

      <View style={style.group}>
        <Text bold caption>
          {L10N.GENERAL.toUpperCase()}
        </Text>
        {OPTIONS(isPremium, subscription).map(({ caption, disabled, icon, id, text, ...rest }) => (
          <Setting
            {...settingProps}
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
          {...settingProps}
          icon={ICON.THEME}
          text={theme === 'dark' ? L10N.APPERANCE_LIGHT : L10N.APPERANCE_DARK}
          onPress={handleTheme}
        />
        {PREFERENCES.map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            caption={rest.screen === 'baseCurrency' ? L10N.CURRENCY_NAME[baseCurrency] : undefined}
            activity={activity && activity[rest.callback]}
            key={`preference-${index}`}
            {...{ disabled, icon, text }}
            onPress={() => handleOption(rest)}
          />
        ))}
        <Setting
          {...settingProps}
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
            {...settingProps}
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
