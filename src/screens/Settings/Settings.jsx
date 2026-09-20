import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';

import { Colophon } from './components';
import { getLatestRates } from './helpers';
import { ABOUT, APPEARANCE_OPTIONS, DATA, LANGUAGE_OPTIONS, TEXT_SIZE_OPTIONS } from './Settings.constants';
import { getStyles } from './Settings.style';
import { Chip, Eyebrow, Icon, Masthead, Pressable, Screen, Setting, SettingSelect, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import {
  backupAge,
  biometricName,
  C,
  currencySymbol,
  eventEmitter,
  ICON,
  L10N,
  verboseDate,
} from '../../modules';
import { setLanguage } from '../../i18n';
import { BackupService, BiometricAuthService, NotificationsService } from '../../services';

const { EVENT } = C;

const Settings = ({ navigation = {} }) => {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const store = useStore();
  const { colors, textScale, themePreference } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [activity, setActivity] = useState({});
  const [biometric, setBiometric] = useState({});

  const {
    accounts = [],
    importBackup,
    scheduledTxs = [],
    resetAppData,
    updateSettings,
    updateTheme,
    settings = {},
    txs = [],
  } = store;

  const {
    backupAt,
    baseCurrency,
    biometricUnlockEnabled = false,
    language = 'en',
    lastRatesUpdate = '',
    pin,
    reminders,
  } = settings;

  useEffect(() => {
    let active = true;

    const readAvailability = async () => {
      const availability = await BiometricAuthService.isAvailable()['catch'](() => undefined);
      if (active) setBiometric({ available: !!availability?.available, kind: availability?.kind });
    };

    readAvailability();

    return () => {
      active = false;
    };
  }, []);

  const handleBiometricUnlock = async (next) => {
    setActivity((prev) => ({ ...(prev || {}), biometricUnlock: true }));
    try {
      if (!next) {
        await BiometricAuthService.clearPin();
        await updateSettings({ biometricUnlockEnabled: false });
        return;
      }

      // The PIN is what the reader hands back, so there is nothing to store until one exists.
      if (!pin) {
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.BIOMETRIC_UNLOCK_REQUIRES_PIN });
        return;
      }

      await BiometricAuthService.savePin(pin);
      await updateSettings({ biometricUnlockEnabled: true });
    } catch (error) {
      const code = error?.code;
      if (code === 'ERR_BIOMETRIC_CANCELED') return;

      eventEmitter.emit(EVENT.NOTIFICATION, {
        error: true,
        title:
          code === 'ERR_BIOMETRIC_NOT_AVAILABLE' || code === 'ERR_BIOMETRIC_NOT_ENROLLED' || code === 'ERR_BIOMETRIC_WEAK'
            ? L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE
            : L10N.ERROR_TRY_AGAIN,
      });
    } finally {
      setActivity((prev) => ({ ...(prev || {}), biometricUnlock: false }));
    }
  };

  const handleUpdateRates = async () => {
    setActivity((prev) => ({ ...(prev || {}), handleUpdateRates: true }));
    await getLatestRates({ store });
    setActivity((prev) => ({ ...(prev || {}), handleUpdateRates: false }));
  };

  const handleOption = ({ callback, screen, url }) => {
    if (url) Linking.openURL(url);
    if (screen) navigation.navigate(screen);
    else if (callback === 'handleExport') handleExport();
    else if (callback === 'handleExportCsv') handleExportCsv();
    else if (callback === 'handleImport') handleImport();
    else if (callback === 'handleUpdateRates') handleUpdateRates();
  };

  const handleExport = async () => {
    try {
      const ok = await BackupService.export({
        accounts,
        scheduledTxs,
        settings,
        txs,
      });
      if (ok) {
        await updateSettings({ backupAt: Date.now() });
        eventEmitter.emit(EVENT.NOTIFICATION, {
          title: L10N.CONFIRM_EXPORT_SUCCESS,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const ok = await BackupService.exportCsv({ accounts, settings, txs });
      if (ok)
        eventEmitter.emit(EVENT.NOTIFICATION, {
          title: L10N.CONFIRM_EXPORT_SUCCESS,
        });
    } catch (error) {
      handleError(error);
    }
  };

  const handleImport = async () => {
    const backup = await BackupService.import().catch(handleError);

    if (backup) {
      eventEmitter.emit(EVENT.CONFIRM, {
        title: L10N.CONFIRM_IMPORT,
        caption: L10N.CONFIRM_IMPORT_CAPTION(backup),
        actionLabel: L10N.ACCEPT,
        onAction: async () => {
          const { settings: { theme } = {} } = backup || {};

          if (theme) updateTheme(theme);
          await importBackup(backup);
          navigation.navigate('dashboard');
          eventEmitter.emit(EVENT.NOTIFICATION, {
            title: L10N.CONFIRM_IMPORT_SUCCESS,
          });
        },
      });
    }
  };

  const handleError = () =>
    eventEmitter.emit(EVENT.NOTIFICATION, {
      error: true,
      text: L10N.ERROR_TRY_AGAIN,
    });

  const handleTheme = (next) => {
    updateTheme(next);
  };

  const handleTextSize = (next) => updateSettings({ textSize: next });

  const currencyOptions = Object.keys(C.SYMBOL).map((code) => ({
    label: L10N.CURRENCY_NAME[code] || code,
    symbol: currencySymbol(code),
    value: code,
  }));

  // The store converts the cached series to the new base and tops it up: a base change must not need the network.
  const handleBaseCurrency = (next) => updateSettings({ baseCurrency: next });

  const RightValueChevron = ({ figure, value }) => (
    <View row align="center" gap="xxs">
      {figure ? (
        <Text figure="sm" tone="muted">
          {value}
        </Text>
      ) : (
        <Text size="s" tone="muted">
          {value}
        </Text>
      )}
      <Icon name={ICON.RIGHT} size="s" tone="muted" />
    </View>
  );

  const RightCountChevron = ({ count }) => (
    <View row align="center" gap="xxs">
      <Text figure="sm" tone="muted">
        {count}
      </Text>
      <Icon name={ICON.RIGHT} size="s" tone="muted" />
    </View>
  );

  const handleLanguage = async (next) => {
    updateSettings({ language: next });
    await setLanguage(next);
  };

  const handleChangeReminder = (next) => {
    const value = typeof next === 'object' ? next.value : next ? 1 : 0;
    NotificationsService.reminders([value]);
    updateSettings({ reminders: [value] });
  };

  const handleLogout = () => {
    eventEmitter.emit(EVENT.CONFIRM, {
      title: L10N.CONFIRM_LOG_OUT,
      caption: L10N.CONFIRM_LOG_OUT_CAPTION,
      actionLabel: L10N.ACCEPT,
      onAction: () => {
        // Settings lives inside Tabs -> Stack, so the root stack owns the lock screen.
        const root = navigation?.getParent?.()?.getParent?.();
        if (root?.reset) root.reset({ index: 0, routes: [{ name: 'session' }] });
        else navigation?.navigate?.('session');
      },
    });
  };

  const handleResetData = () => {
    eventEmitter.emit(EVENT.CONFIRM, {
      title: L10N.RESET_DATA,
      caption: L10N.RESET_DATA_CAPTION,
      actionLabel: L10N.NEXT,
      onAction: () => {
        eventEmitter.emit(EVENT.CONFIRM, {
          title: L10N.RESET_DATA_CONFIRM,
          caption: L10N.RESET_DATA_CONFIRM_CAPTION,
          actionLabel: L10N.RESET_DATA_ACTION,
          onAction: async () => {
            await resetAppData?.();
            const root = navigation?.getParent?.()?.getParent?.();
            if (root?.reset) root.reset({ index: 0, routes: [{ name: 'onboarding' }] });
            else navigation?.navigate?.('onboarding');
          },
        });
      },
    });
  };

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
  // One reading for every row that reports when it last ran, so rates and backups cannot drift apart.
  const lastRunValue = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';

    // Time-only is easier to scan when the date is obvious.
    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString(resolvedLocale, { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleString(resolvedLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const lastRatesUpdatedValue = lastRunValue(lastRatesUpdate);
  const lastBackupValue = lastRunValue(backupAt);
  const backupReminderSubtitle = (() => {
    if (!backupReminderEnabled) return L10N.REMINDER_BACKUP_CAPTION;

    // Matches NotificationsService.reminders() weekly trigger: Sunday at 08:00 local time.
    const sunday = new Date(2024, 0, 7, 8, 0, 0, 0); // Sunday
    const weekday = sunday.toLocaleDateString(resolvedLocale, {
      weekday: 'short',
    });
    const time = sunday.toLocaleTimeString(resolvedLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${L10N.SCHEDULED_PATTERN_WEEKLY} - ${weekday} ${time}`;
  })();

  const { stale: backupStale } = backupAge(backupAt);
  const backupCaption = backupAt
    ? `${L10N.BACKUP_LAST} \u00B7 ${verboseDate(new Date(backupAt), { locale: resolvedLocale, relative: true })}`
    : L10N.BACKUP_NEVER;
  const handleScheduledPress = () =>
    navigation.navigate(
      scheduledTxs.length ? 'scheduled' : 'scheduledForm',
      scheduledTxs.length ? undefined : { create: true },
    );

  return (
    <>
      <Masthead section={L10N.SETTINGS} />
      <Screen ref={scrollRef} style={style.screen}>
        {/* A nudge on the same weekly clock as the reminder, never a permanent band: Data always offers the export. */}
        {backupStale ? (
          <Pressable onPress={handleExport}>
            <View row style={style.backup}>
              <Icon name={ICON.ALERT} tone="onAccentSoft" />
              <View flex>
                <Text medium size="s" tone="onAccentSoft">
                  {L10N.EXPORT_DATA}
                </Text>
                <Text size="xxs" style={style.backupCaption} tone="onAccentSoft">
                  {backupCaption}
                </Text>
              </View>
              <Chip label={L10N.BACKUP_CTA} size="s" variant="inverse" onPress={handleExport} />
            </View>
          </Pressable>
        ) : null}

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.DATA}</Eyebrow>
          {DATA().map(({ disabled, id, text, ...rest }, index) => {
            const isUpdateRates = rest.callback === 'handleUpdateRates';
            const showSpinner = isUpdateRates && activity?.handleUpdateRates;
            const lastRun = isUpdateRates
              ? lastRatesUpdatedValue
              : rest.callback === 'handleExport'
                ? lastBackupValue
                : '';

            return (
              <Setting
                divider={index > 0}
                key={`data-${id}`}
                disabled={disabled}
                title={text}
                type="navigation"
                activity={showSpinner}
                right={
                  showSpinner ? undefined : lastRun ? (
                    <RightValueChevron figure value={lastRun} />
                  ) : (
                    <Icon name={ICON.RIGHT} size="s" tone="muted" />
                  )
                }
                onPress={rest.callback ? () => handleOption(rest) : undefined}
              />
            );
          })}
        </View>

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.APPEARANCE}</Eyebrow>
          <SettingSelect
            options={APPEARANCE_OPTIONS}
            title={L10N.THEME}
            value={themePreference}
            onChange={handleTheme}
          />
          <SettingSelect
            divider
            options={TEXT_SIZE_OPTIONS()}
            title={L10N.TEXT_SIZE}
            value={textScale}
            onChange={handleTextSize}
          />
        </View>

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.PREFERENCES}</Eyebrow>
          <SettingSelect
            options={LANGUAGE_OPTIONS}
            title={L10N.LANGUAGE}
            value={language}
            onChange={handleLanguage}
          />
          <SettingSelect
            divider
            options={currencyOptions}
            title={L10N.CHOOSE_CURRENCY}
            value={baseCurrency}
            onChange={handleBaseCurrency}
          />
          <Setting
            divider
            title={L10N.SCHEDULED}
            type="navigation"
            right={
              scheduledCount ? <RightCountChevron count={scheduledCount} /> : <RightValueChevron value={L10N.NEW} />
            }
            onPress={handleScheduledPress}
          />
          <Setting
            divider
            subtitle={backupReminderSubtitle}
            title={L10N.REMINDER_BACKUP}
            type="toggle"
            value={backupReminderEnabled}
            onValueChange={handleChangeReminder}
          />
        </View>

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.UNLOCK}</Eyebrow>
          <Setting
            activity={activity?.biometricUnlock}
            disabled={!biometricUnlockEnabled && biometric.available !== true}
            subtitle={biometric.available === false ? L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE : undefined}
            title={biometricName(biometric.kind)}
            type="toggle"
            value={biometricUnlockEnabled}
            onValueChange={handleBiometricUnlock}
          />
        </View>

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.ABOUT}</Eyebrow>
          {ABOUT().map(({ disabled, text, ...rest }, index) => (
            <Setting
              divider={index > 0}
              activity={rest.callback ? activity?.[rest.callback] : undefined}
              key={`about-${index}`}
              {...{ disabled, title: text }}
              onPress={() => handleOption(rest)}
            />
          ))}
        </View>

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.ACCOUNT_ACTIONS}</Eyebrow>
          <Setting title={L10N.LOG_OUT} type="action" onPress={handleLogout} />
          <Setting divider title={L10N.RESET_DATA} titleTone="danger" type="action" onPress={handleResetData} />
        </View>

        <Colophon />
      </Screen>
    </>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
