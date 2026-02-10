import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, Linking } from 'react-native';

import { getLatestRates } from './helpers';
import { ABOUT, DATA, PREMIUM, PREFERENCES } from './Settings.constants';
import { style } from './Settings.style';
import { Chip, Heading, Icon, Screen, Setting, Text, View } from '../../components';
import { useStore } from '../../contexts';
import { C, eventEmitter, ICON, L10N } from '../../modules';
import { BackupService, NotificationsService, PurchaseService } from '../../services';

const { EVENT } = C;

const Settings = ({ navigation = {} }) => {
  const store = useStore();

  const [activity, setActivity] = useState({});

  const {
    accounts = [],
    importBackup,
    scheduledTxs = [],
    resetAppData,
    updateSettings,
    updateSubscription,
    updateTheme,
    settings = {},
    subscription,
    txs = [],
  } = store;

  const { baseCurrency, language = 'en', lastRatesUpdate = '', reminders, theme } = settings;

  const isPremium = !!subscription?.productIdentifier;
  const subscriptionStatus = subscription?.productIdentifier
    ? subscription?.productIdentifier?.split('.')?.[0] === 'lifetime'
      ? L10N.PREMIUM_LIFETIME
      : L10N.PREMIUM_YEARLY
    : undefined;

  const handleUpdateRates = async () => {
    setActivity((prev) => ({ ...(prev || {}), handleUpdateRates: true }));
    await getLatestRates({ store });
    setActivity((prev) => ({ ...(prev || {}), handleUpdateRates: false }));
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

  const handleSubscription = () => {
    if (subscription?.productIdentifier) navigation.navigate('subscription');
    setActivity((prev) => ({ ...(prev || {}), handleSubscription: true }));
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
        setActivity((prev) => ({ ...(prev || {}), handleSubscription: false }));
      })
      .catch((error) => {
        setActivity((prev) => ({ ...(prev || {}), handleSubscription: false }));
        handleError(error);
      });
  };

  const handleRestorePurchases = () => {
    setActivity((prev) => ({ ...(prev || {}), handleRestorePurchases: true }));
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription?.productIdentifier) {
          updateSubscription(activeSubscription);
          eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.PURCHASE_RESTORED });
        } else {
          eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.PURCHASES_NOT_FOUND });
        }
        setActivity((prev) => ({ ...(prev || {}), handleRestorePurchases: false }));
      })
      .catch((error) => {
        setActivity((prev) => ({ ...(prev || {}), handleRestorePurchases: false }));
        handleError(error);
      });
  };

  const handleError = () => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.ERROR_TRY_AGAIN });

  const handleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    updateTheme(nextTheme);
    updateSettings({ theme: nextTheme });
  };

  const RightValueChevron = ({ value }) => (
    <View row align="center" gap="xxs">
      <Text tone="secondary" size="s">
        {value}
      </Text>
      <Icon name={ICON.RIGHT} tone="secondary" />
    </View>
  );

  const RightCountChevron = ({ count }) => (
    <View row align="center" gap="xxs">
      <Chip label={count} variant="accent" shape={count < 10 ? 'circle' : 'pill'} />
      <Icon name={ICON.RIGHT} tone="secondary" />
    </View>
  );

  const RightPremiumChevron = () => (
    <View row align="center" gap="xxs">
      <Chip label={L10N.PREMIUM} variant="muted" />
      <Icon name={ICON.RIGHT} tone="secondary" />
    </View>
  );

  const handleLanguage = () => navigation.navigate('language');

  const handleChangeReminder = (next) => {
    const value = typeof next === 'object' ? next.value : next ? 1 : 0;
    NotificationsService.reminders([value]);
    updateSettings({ reminders: [value] });
  };

  const handleLogout = () => {
    Alert.alert(L10N.CONFIRM_LOG_OUT, L10N.CONFIRM_LOG_OUT_CAPTION, [
      { text: L10N.CANCEL, style: 'cancel' },
      {
        text: L10N.ACCEPT,
        style: 'destructive',
        onPress: async () => {
          await updateSettings({ onboarded: false });
          // Settings lives inside Tabs -> Stack. Reset the root stack to onboarding.
          const root = navigation?.getParent?.()?.getParent?.();
          if (root?.reset) root.reset({ index: 0, routes: [{ name: 'onboarding' }] });
          else navigation?.navigate?.('onboarding');
        },
      },
    ]);
  };

  const handleResetData = () => {
    Alert.alert(L10N.RESET_DATA, L10N.RESET_DATA_CAPTION, [
      { text: L10N.CANCEL, style: 'cancel' },
      {
        text: L10N.NEXT,
        style: 'destructive',
        onPress: () => {
          Alert.alert(L10N.RESET_DATA_CONFIRM, L10N.RESET_DATA_CONFIRM_CAPTION, [
            { text: L10N.CANCEL, style: 'cancel' },
            {
              text: L10N.RESET_DATA_ACTION,
              style: 'destructive',
              onPress: async () => {
                await resetAppData?.();
                const root = navigation?.getParent?.()?.getParent?.();
                if (root?.reset) root.reset({ index: 0, routes: [{ name: 'onboarding' }] });
                else navigation?.navigate?.('onboarding');
              },
            },
          ]);
        },
      },
    ]);
  };

  const revenueCatCustomerId = subscription?.customerInfo?.originalAppUserId;

  const currentLanguageLabel =
    language === 'es'
      ? L10N.LANGUAGE_ES
      : language === 'pt'
      ? L10N.LANGUAGE_PT
      : language === 'fr'
      ? L10N.LANGUAGE_FR
      : language === 'de'
      ? L10N.LANGUAGE_DE
      : L10N.LANGUAGE_EN;
  const scheduledCount = scheduledTxs.length;
  const backupReminderEnabled = (reminders?.[0] ?? 1) === 1;
  const resolvedLocale =
    language === 'es'
      ? 'es-ES'
      : language === 'pt'
      ? 'pt-PT'
      : language === 'fr'
      ? 'fr-FR'
      : language === 'de'
      ? 'de-DE'
      : 'en-US';
  const lastRatesDate = lastRatesUpdate ? new Date(lastRatesUpdate) : null;
  const lastRatesUpdatedValue = (() => {
    if (!lastRatesDate || Number.isNaN(lastRatesDate.getTime())) return '';
    const now = new Date();
    const isToday = lastRatesDate.toDateString() === now.toDateString();

    if (isToday) {
      // Time-only is easier to scan when the date is obvious.
      return lastRatesDate.toLocaleTimeString(resolvedLocale, { hour: '2-digit', minute: '2-digit' });
    }

    return lastRatesDate.toLocaleString(resolvedLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  })();
  const backupReminderSubtitle = (() => {
    if (!backupReminderEnabled) return L10N.REMINDER_BACKUP_CAPTION;

    // Matches NotificationsService.reminders() weekly trigger: Sunday at 08:00 local time.
    const sunday = new Date(2024, 0, 7, 8, 0, 0, 0); // Sunday
    const weekday = sunday.toLocaleDateString(resolvedLocale, { weekday: 'short' });
    const time = sunday.toLocaleTimeString(resolvedLocale, { hour: '2-digit', minute: '2-digit' });

    return `${L10N.SCHEDULED_PATTERN_WEEKLY} - ${weekday} ${time}`;
  })();
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
          {L10N.PREMIUM.toUpperCase()}
        </Text>
        {PREMIUM(isPremium, subscription).map(({ disabled, icon, id, text, ...rest }) => (
          <Setting
            {...settingProps}
            activity={rest.callback ? activity?.[rest.callback] : undefined}
            key={`premium-${id}`}
            disabled={disabled}
            icon={icon}
            title={text}
            type={rest.callback === 'handleRestorePurchases' ? 'action' : 'navigation'}
            right={
              rest.callback === 'handleSubscription'
                ? isPremium
                  ? <RightValueChevron value={subscriptionStatus} />
                  : <RightPremiumChevron />
                : undefined
            }
            onPress={rest.callback ? () => handleOption(rest) : undefined}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold size="s">
          {L10N.DATA.toUpperCase()}
        </Text>
        {DATA().map(({ disabled, icon, id, text, ...rest }) => {
          const isUpdateRates = rest.callback === 'handleUpdateRates';
          const isExportBackup = rest.callback === 'handleExport';
          const isExportCsv = rest.callback === 'handleExportCsv';
          const gated = !isPremium && (isExportBackup || isExportCsv);
          const showSpinner = isUpdateRates && activity?.handleUpdateRates;

          return (
            <Setting
              {...settingProps}
              key={`data-${id}`}
              disabled={disabled}
              icon={icon}
              title={text}
              type="navigation"
              activity={showSpinner}
              right={
                showSpinner
                  ? undefined
                  : gated
                  ? <RightPremiumChevron />
                  : isUpdateRates && lastRatesUpdatedValue
                  ? <RightValueChevron value={lastRatesUpdatedValue} />
                  : <Icon name={ICON.RIGHT} tone="secondary" />
              }
              onPress={rest.callback ? () => handleOption(rest) : undefined}
            />
          );
        })}
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
          type="toggle"
          value={theme === 'dark'}
          onValueChange={handleTheme}
        />
        <Setting
          {...settingProps}
          icon={ICON.LANGUAGE}
          title={L10N.LANGUAGE}
          type="navigation"
          onPress={handleLanguage}
          right={<RightValueChevron value={currentLanguageLabel} />}
        />
        {PREFERENCES().map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            activity={rest.callback ? activity?.[rest.callback] : undefined}
            key={`preference-${index}`}
            {...{ disabled, icon, title: text }}
            right={
              rest.screen === 'baseCurrency' ? <RightValueChevron value={L10N.CURRENCY_NAME[baseCurrency]} /> : undefined
            }
            onPress={() => handleOption(rest)}
          />
        ))}
        <Setting
          {...settingProps}
          icon={ICON.SCHEDULED}
          title={L10N.SCHEDULED}
          type="navigation"
          right={
            scheduledCount
              ? <RightCountChevron count={scheduledCount} />
              : <RightValueChevron value={L10N.NEW} />
          }
          onPress={handleScheduledPress}
        />
        <Setting
          {...settingProps}
          subtitle={backupReminderSubtitle}
          icon={ICON.BELL}
          type="toggle"
          value={backupReminderEnabled}
          onValueChange={handleChangeReminder}
          title={L10N.REMINDER_BACKUP}
        />
      </View>

      <View style={style.group}>
        <Text bold size="s">
          {L10N.ABOUT.toUpperCase()}
        </Text>
        {ABOUT().map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            activity={rest.callback ? activity?.[rest.callback] : undefined}
            key={`about-${index}`}
            {...{ disabled, icon, title: text }}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold size="s">
          {L10N.ACCOUNT_ACTIONS.toUpperCase()}
        </Text>

        <Setting
          icon={ICON.BACK}
          title={L10N.LOG_OUT}
          type="action"
          onPress={handleLogout}
        />
        <Setting
          icon={ICON.ALERT}
          iconTone="danger"
          title={L10N.RESET_DATA}
          titleTone="danger"
          subtitle={L10N.RESET_DATA_CAPTION}
          subtitleTone="secondary"
          type="action"
          onPress={handleResetData}
        />

        <View style={style.idsBlock}>
          <Text align="center" size="xs" tone="secondary">{`Money v${C.VERSION}`}</Text>
          {revenueCatCustomerId ? (
            <Text align="center" selectable size="xs" tone="secondary">
              {revenueCatCustomerId}
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
