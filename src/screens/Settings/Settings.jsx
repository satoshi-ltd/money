import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';

import { getLatestRates } from './helpers';
import { ABOUT, OPTIONS, PREFERENCES } from './Settings.constants';
import { style } from './Settings.style';
import { Dropdown, Heading, Screen, Setting, Text, View } from '../../components';
import { useStore } from '../../contexts';
import { setLanguage } from '../../i18n';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { verboseDate } from '../../modules';
import { BackupService, NotificationsService, PurchaseService } from '../../services';

const { EVENT } = C;

const Settings = ({ navigation = {} }) => {
  const store = useStore();

  const [activity, setActivity] = useState();
  const [showLanguage, setShowLanguage] = useState(false);

  const {
    accounts = [],
    importBackup,
    scheduledTxs = [],
    updateSettings,
    updateSubscription,
    updateTheme,
    settings = {},
    subscription,
    txs = [],
  } = store;

  const { baseCurrency, language = 'en', lastRatesUpdate = '', reminders, theme } = settings;

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
    else if (callback === 'handleExportCsv') handleExportCsv();
    else if (callback === 'handleImport') handleImport();
    else if (callback === 'handleUpdateRates') handleUpdateRates();
    else if (callback === 'handleRestorePurchases') handleRestorePurchases();
  };

  const handleExport = async () => {
    if (!isPremium) return handleSubscription('export');

    try {
      const ok = await BackupService.export({ accounts, scheduledTxs, settings, txs });
      if (ok) eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_EXPORT_SUCCESS });
    } catch (error) {
      handleError(error);
    }
  };

  const handleExportCsv = async () => {
    if (!isPremium) return handleSubscription('export');

    try {
      const ok = await BackupService.exportCsv({ accounts, settings, txs });
      if (ok) eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_EXPORT_SUCCESS });
    } catch (error) {
      handleError(error);
    }
  };

  const handleImport = async () => {
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

  const handleLanguage = (next) => {
    if (!next) return;
    updateSettings({ language: next.id });
    setLanguage(next.id);
  };

  const handleChangeReminder = (next) => {
    const value = typeof next === 'object' ? next.value : next ? 1 : 0;
    NotificationsService.reminders([value]);
    updateSettings({ reminders: [value] });
  };

  const languageOptions = [
    { id: 'en', label: L10N.LANGUAGE_EN },
    { id: 'es', label: L10N.LANGUAGE_ES },
    { id: 'pt', label: L10N.LANGUAGE_PT },
    { id: 'fr', label: L10N.LANGUAGE_FR },
    { id: 'de', label: L10N.LANGUAGE_DE },
  ];
  const currentLanguageLabel = languageOptions.find((option) => option.id === language)?.label || L10N.LANGUAGE_EN;
  const scheduledSubtitle = scheduledTxs.length
    ? L10N.SCHEDULED_TOTAL({ count: scheduledTxs.length })
    : L10N.SCHEDULED_EMPTY;
  const handleScheduledPress = () =>
    navigation.navigate(
      scheduledTxs.length ? 'scheduled' : 'scheduledForm',
      scheduledTxs.length ? undefined : { create: true },
    );

  const settingProps = {};

  return (
    <Screen gap offset style={style.screen}>
      <Heading value={L10N.SETTINGS} />

      <View style={style.group}>
        <Text bold size="s">
          {L10N.GENERAL.toUpperCase()}
        </Text>
        {OPTIONS(isPremium, subscription).map(({ caption, disabled, icon, id, text, ...rest }) => (
          <Setting
            {...settingProps}
            activity={activity && rest.callback ? activity[rest.callback] : undefined}
            key={`option-${id}`}
            {...{
              activity: rest.callback === 'handleUpdateRates' && activity?.updateRates,
              subtitle:
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
              title: text,
            }}
            onPress={rest.callback ? () => handleOption(rest) : undefined}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold size="s">
          {L10N.PREFERENCES.toUpperCase()}
        </Text>
        <Setting
          {...settingProps}
          icon={ICON.THEME}
          title={L10N.APPEARANCE}
          subtitle={theme === 'dark' ? L10N.APPERANCE_DARK : L10N.APPERANCE_LIGHT}
          type="action"
          onPress={handleTheme}
        />
        <View style={style.dropdownWrap}>
          <Setting
            {...settingProps}
            subtitle={currentLanguageLabel}
            icon={ICON.LANGUAGE}
            title={L10N.LANGUAGE}
            type="navigation"
            onPress={() => setShowLanguage(true)}
          />
          <Dropdown
            visible={showLanguage}
            onClose={() => setShowLanguage(false)}
            options={languageOptions}
            selected={language}
            onSelect={(option) => {
              handleLanguage(option);
              setShowLanguage(false);
            }}
            width={260}
          />
        </View>
        {PREFERENCES().map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            subtitle={rest.screen === 'baseCurrency' ? L10N.CURRENCY_NAME[baseCurrency] : undefined}
            activity={activity && activity[rest.callback]}
            key={`preference-${index}`}
            {...{ disabled, icon, title: text }}
            onPress={() => handleOption(rest)}
          />
        ))}
        <Setting
          {...settingProps}
          icon={ICON.SCHEDULED}
          subtitle={scheduledSubtitle}
          title={L10N.SCHEDULED}
          type="navigation"
          onPress={handleScheduledPress}
        />
        <Setting
          {...settingProps}
          subtitle={L10N.REMINDER_BACKUP_CAPTION}
          icon={ICON.BELL}
          type="toggle"
          value={(reminders?.[0] ?? 1) === 1}
          onValueChange={handleChangeReminder}
          title={L10N.REMINDER_BACKUP}
        />
      </View>

      <View style={style.group}>
        <Text bold size="s">
          {L10N.ABOUT.toUpperCase()}
        </Text>
        {ABOUT(isPremium).map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            activity={activity && activity[rest.callback]}
            key={`about-${index}`}
            {...{ disabled, icon, title: text }}
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
