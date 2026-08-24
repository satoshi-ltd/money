import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';

import { getLatestRates } from './helpers';
import { ABOUT, APPEARANCE_OPTIONS, DATA, LANGUAGE_OPTIONS, PREMIUM } from './Settings.constants';
import { getStyles } from './Settings.style';
import { Chip, Eyebrow, Icon, Masthead, Pressable, Screen, Setting, SettingSelect, Text, View } from '../../components';
import { useApp, useStore } from '../../contexts';
import {
  backupAge,
  C,
  currencySymbol,
  eventEmitter,
  hasPremiumAccess,
  ICON,
  L10N,
  PREMIUM_ENABLED,
  verboseDate,
} from '../../modules';
import { setLanguage } from '../../i18n';
import { BackupService, NotificationsService, PurchaseService, ServiceRates } from '../../services';

const { EVENT } = C;

const Settings = ({ navigation = {} }) => {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  const store = useStore();
  const { colors, themePreference } = useApp();
  const style = useMemo(() => getStyles(colors), [colors]);

  const [activity, setActivity] = useState({});

  const {
    accounts = [],
    importBackup,
    scheduledTxs = [],
    resetAppData,
    updateSettings,
    updateRates,
    updateSubscription,
    updateTheme,
    settings = {},
    subscription,
    txs = [],
  } = store;

  const { backupAt, baseCurrency, language = 'en', lastRatesUpdate = '', reminders } = settings;

  const isPremium = hasPremiumAccess(subscription);
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
    if (!isPremium) return handleSubscription('export');

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

  const handleSubscription = () => {
    if (!PREMIUM_ENABLED) return;
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
          eventEmitter.emit(EVENT.NOTIFICATION, {
            title: L10N.PURCHASE_RESTORED,
          });
        } else {
          eventEmitter.emit(EVENT.NOTIFICATION, {
            title: L10N.PURCHASES_NOT_FOUND,
          });
        }
        setActivity((prev) => ({
          ...(prev || {}),
          handleRestorePurchases: false,
        }));
      })
      .catch((error) => {
        setActivity((prev) => ({
          ...(prev || {}),
          handleRestorePurchases: false,
        }));
        handleError(error);
      });
  };

  const handleError = () =>
    eventEmitter.emit(EVENT.NOTIFICATION, {
      error: true,
      text: L10N.ERROR_TRY_AGAIN,
    });

  const handleTheme = (next) => {
    updateTheme(next);
    updateSettings({ theme: next });
  };

  const currencyOptions = Object.keys(C.SYMBOL).map((code) => ({
    label: L10N.CURRENCY_NAME[code] || code,
    symbol: currencySymbol(code),
    value: code,
  }));

  const handleBaseCurrency = async (next) => {
    const nextRates = await ServiceRates.get({ baseCurrency: next, latest: false })['catch'](() => undefined);
    if (!nextRates) return eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES });
    await updateRates({ ...nextRates, currency: next });
  };

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

  const RightPremiumChevron = () => (
    <View row align="center" gap="xxs">
      <Chip label={L10N.PREMIUM} variant="muted" />
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
  const lastRatesDate = lastRatesUpdate ? new Date(lastRatesUpdate) : null;
  const lastRatesUpdatedValue = (() => {
    if (!lastRatesDate || Number.isNaN(lastRatesDate.getTime())) return '';
    const now = new Date();
    const isToday = lastRatesDate.toDateString() === now.toDateString();

    if (isToday) {
      // Time-only is easier to scan when the date is obvious.
      return lastRatesDate.toLocaleTimeString(resolvedLocale, {
        hour: '2-digit',
        minute: '2-digit',
      });
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
        <Pressable onPress={handleExport}>
          <View row style={style.backup}>
            {backupStale ? <Icon name={ICON.ALERT} tone="onAccentSoft" /> : null}
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

        {PREMIUM_ENABLED ? (
          <View style={style.group}>
            <Eyebrow style={style.groupLabel}>{L10N.PREMIUM}</Eyebrow>
            {PREMIUM(isPremium, subscription).map(({ disabled, id, text, ...rest }, index) => (
              <Setting
                activity={rest.callback ? activity?.[rest.callback] : undefined}
                divider={index > 0}
                key={`premium-${id}`}
                disabled={disabled}
                title={text}
                type={rest.callback === 'handleRestorePurchases' ? 'action' : 'navigation'}
                right={
                  rest.callback === 'handleSubscription' ? (
                    isPremium ? (
                      <RightValueChevron value={subscriptionStatus} />
                    ) : (
                      <RightPremiumChevron />
                    )
                  ) : undefined
                }
                onPress={rest.callback ? () => handleOption(rest) : undefined}
              />
            ))}
          </View>
        ) : null}

        <View style={style.group}>
          <Eyebrow style={style.groupLabel}>{L10N.DATA}</Eyebrow>
          {DATA().map(({ disabled, id, text, ...rest }, index) => {
            const isUpdateRates = rest.callback === 'handleUpdateRates';
            const isExportBackup = rest.callback === 'handleExport';
            const isExportCsv = rest.callback === 'handleExportCsv';
            const gated = !isPremium && (isExportBackup || isExportCsv);
            const showSpinner = isUpdateRates && activity?.handleUpdateRates;

            return (
              <Setting
                divider={index > 0}
                key={`data-${id}`}
                disabled={disabled}
                title={text}
                type="navigation"
                activity={showSpinner}
                right={
                  showSpinner ? undefined : gated ? (
                    <RightPremiumChevron />
                  ) : isUpdateRates && lastRatesUpdatedValue ? (
                    <RightValueChevron figure value={lastRatesUpdatedValue} />
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
          <Eyebrow style={style.groupLabel}>{L10N.PREFERENCES}</Eyebrow>
          <SettingSelect
            options={APPEARANCE_OPTIONS}
            title={L10N.APPEARANCE}
            value={themePreference}
            onChange={handleTheme}
          />
          <SettingSelect
            divider
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
            right={
              <Text medium={backupReminderEnabled} size="s" tone={backupReminderEnabled ? undefined : 'muted'}>
                {backupReminderEnabled ? L10N.ON : L10N.OFF}
              </Text>
            }
            subtitle={backupReminderSubtitle}
            title={L10N.REMINDER_BACKUP}
            type="action"
            onPress={() => handleChangeReminder(!backupReminderEnabled)}
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

        <View style={style.version}>
          <Text align="center" size="xxs" tone="muted">
            {`môney v${C.VERSION} · ${L10N.PRIVACY_PROMISE}`}
          </Text>
        </View>
      </Screen>
    </>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
