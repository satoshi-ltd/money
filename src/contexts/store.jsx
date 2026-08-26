import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { consolidate, isRatesSyncDue, migrateState, RATES_SYNC_INTERVAL } from './modules';
import { runScheduledSync } from './modules/runScheduledSync';
import { useToday } from '../hooks';
import { detectDeviceLanguage, setLanguage } from '../i18n';
import {
  buildAutoAccountCatalog,
  buildAutoAmountCatalog,
  buildAutoCategoryCatalog,
} from '../modules';
import {
  // -- account
  createAccount,
  updateAccount,
  deleteAccount,
  // -- tx
  createTx,
  updateTx,
  deleteTx,
  // -- scheduledTxs
  createScheduled,
  updateScheduled,
  deleteScheduled,
  // -- settings
  updateSettings,
  updateRates,
  importBackup,
  resetAppData,
} from './reducers';
import { DEFAULTS, FILENAME } from './store.constants';
import { NotificationsService, ratesOrSeed, rebaseRates, ServiceRates, StorageService } from '../services';

const StoreDataContext = createContext({});
const StoreActionsContext = createContext({});
const AppPreferencesContext = createContext({
  language: DEFAULTS.settings.language,
  theme: DEFAULTS.settings.theme,
});
const AmountSettingsContext = createContext({
  baseCurrency: DEFAULTS.settings.baseCurrency,
  maskAmount: DEFAULTS.settings.maskAmount,
});

const scheduledForAccounts = ({ accounts = [], scheduledTxs = [] } = {}) => {
  const accountHashes = new Set(accounts.map(({ hash }) => hash));
  return scheduledTxs.filter(({ account } = {}) => accountHashes.has(account));
};

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);
  const [bootError, setBootError] = useState();
  const today = useToday();
  const stateRef = useRef(state);
  const ratesSyncInFlightRef = useRef(false);
  const syncRatesRef = useRef();

  stateRef.current = state;

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      const [accounts, scheduledTxs, settings, txs] = await Promise.all([
        store.get('accounts')?.value,
        store.get('scheduledTxs')?.value,
        store.get('settings')?.value,
        store.get('txs')?.value,
      ]);
      const rawState = { accounts, scheduledTxs, settings, txs };
      let migrated = migrateState(rawState);

      const resolvedLanguage = migrated.settings.language || detectDeviceLanguage();
      if (resolvedLanguage !== migrated.settings.language) {
        const nextSettings = { ...migrated.settings, language: resolvedLanguage };
        await store.get('settings').save(nextSettings);
        migrated = { ...migrated, settings: nextSettings };
      }
      await setLanguage(migrated.settings.language);

      const autoCategory = migrated.settings?.autoCategory || {};
      const autoAccount = migrated.settings?.autoAccount || {};
      const autoAmount = migrated.settings?.autoAmount || {};

      const hasCategoryRules = Object.keys(autoCategory.rules || {}).length > 0;
      const hasAccountRules = Object.keys(autoAccount.rules || {}).length > 0;
      const hasAmountRules = Object.keys(autoAmount.rules || {}).length > 0;
      if ((!hasCategoryRules || !hasAccountRules || !hasAmountRules) && (migrated.txs || []).length > 0) {
        const nextSettings = { ...migrated.settings };

        if (!hasCategoryRules) {
          const catalog = buildAutoCategoryCatalog(migrated.txs);
          nextSettings.autoCategory = { ...autoCategory, ...catalog };
        }

        if (!hasAccountRules) {
          const catalog = buildAutoAccountCatalog(migrated.txs);
          nextSettings.autoAccount = { ...autoAccount, ...catalog };
        }

        if (!hasAmountRules) {
          const catalog = buildAutoAmountCatalog(migrated.txs);
          nextSettings.autoAmount = { ...autoAmount, ...catalog };
        }

        await store.get('settings').save(nextSettings);
        migrated = { ...migrated, settings: nextSettings };
      }

      migrated = await runScheduledSync({ migrated, store, syncNotifications: false });

      if (migrated.settings.schemaVersion !== rawState?.settings?.schemaVersion) {
        await store.get('settings').save(migrated.settings);
      }

      const { rates, seeded } = ratesOrSeed(
        await store.get('rates')?.value,
        migrated.settings?.baseCurrency,
        migrated.settings?.lastRatesUpdate,
      );
      // Bundled rates are not a download: saying otherwise dates a stale series in Settings.
      if (seeded && migrated.settings?.lastRatesUpdate) {
        migrated.settings = { ...migrated.settings, lastRatesUpdate: undefined };
        await store.get('settings').save(migrated.settings);
      }

      setState({
        store,
        accounts: migrated.accounts,
        scheduledTxs: migrated.scheduledTxs,
        settings: migrated.settings,
        rates,
        txs: migrated.txs,
      });

    })().catch(setBootError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.store) return undefined;

    let disposed = false;

    const syncRates = async ({ force = false } = {}) => {
      const current = stateRef.current;
      if (!current?.store || ratesSyncInFlightRef.current) return;

      if (!isRatesSyncDue({ force, lastRatesUpdate: current.settings?.lastRatesUpdate })) return;

      ratesSyncInFlightRef.current = true;
      try {
        const rates = await ServiceRates.get({
          baseCurrency: current?.settings?.baseCurrency,
          known: current?.rates,
        }).catch(() => undefined);

        if (disposed || !rates) return;

        const latest = stateRef.current;
        if (!latest?.store) return;
        await updateRates(rates, [latest, setState]);
      } finally {
        ratesSyncInFlightRef.current = false;
      }
    };

    syncRatesRef.current = syncRates;

    const current = stateRef.current;
    NotificationsService.syncScheduled({
      scheduledTxs: scheduledForAccounts(current),
      txs: current.txs || [],
    });
    syncRates();
    const ratesIntervalId = setInterval(() => {
      syncRates();
    }, RATES_SYNC_INTERVAL);

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;

      const current = stateRef.current;
      if (!current?.store) return;

      (async () => {
        const nextMigrated = await runScheduledSync({
          migrated: {
            accounts: current.accounts || [],
            scheduledTxs: current.scheduledTxs || [],
            settings: current.settings || {},
            txs: current.txs || [],
          },
          store: current.store,
          syncNotifications: false,
        });
        if (nextMigrated.settings !== current.settings || nextMigrated.txs !== current.txs) {
          setState((prev) => ({
            ...prev,
            settings: nextMigrated.settings,
            txs: nextMigrated.txs,
          }));
        }
        NotificationsService.syncScheduled({
          scheduledTxs: scheduledForAccounts(nextMigrated),
          txs: nextMigrated.txs || [],
        });
        await syncRates();
      })();
    });

    return () => {
      disposed = true;
      syncRatesRef.current = undefined;
      clearInterval(ratesIntervalId);
      appStateSubscription.remove();
    };
  }, [state.store]);

  useEffect(() => {
    const current = stateRef.current;
    const { baseCurrency, ratesBaseCurrency } = current.settings || {};
    if (!current.store || !baseCurrency || ratesBaseCurrency === baseCurrency) return;

    // Cross rates are exact: convert the cache in place so the new base works offline and downloads nothing.
    updateRates(rebaseRates(current.rates, baseCurrency), [current, setState], { downloaded: false }).then(() =>
      syncRatesRef.current?.(),
    );
  }, [state.store, state.settings?.baseCurrency, state.settings?.ratesBaseCurrency]);

  const baseCurrency = state.settings?.baseCurrency;
  const consolidatedLedger = useMemo(
    () =>
      state.store
        ? consolidate({
            accounts: state.accounts,
            now: today,
            rates: state.rates,
            settings: { baseCurrency },
            txs: state.txs,
          })
        : undefined,
    [state.store, state.accounts, state.rates, state.txs, baseCurrency, today],
  );

  const actions = useMemo(
    () => ({
      // -- account
      createAccount: (...props) => createAccount(...props, [stateRef.current, setState]),
      updateAccount: (...props) => updateAccount(...props, [stateRef.current, setState]),
      deleteAccount: (...props) => deleteAccount(...props, [stateRef.current, setState]),
      // -- tx
      createTx: (...props) => createTx(...props, [stateRef.current, setState]),
      updateTx: (...props) => updateTx(...props, [stateRef.current, setState]),
      deleteTx: (...props) => deleteTx(...props, [stateRef.current, setState]),
      // -- scheduledTxs
      createScheduled: (...props) => createScheduled(...props, [stateRef.current, setState]),
      updateScheduled: (...props) => updateScheduled(...props, [stateRef.current, setState]),
      deleteScheduled: (...props) => deleteScheduled(...props, [stateRef.current, setState]),
      // -- settings
      updateSettings: (...props) => updateSettings(...props, [stateRef.current, setState]),
      updateRates: (...props) => updateRates(...props, [stateRef.current, setState]),
      updateTheme: (theme) => updateSettings({ theme }, [stateRef.current, setState]),
      importBackup: (...props) => importBackup(...props, [stateRef.current, setState]),
      resetAppData: (...props) => resetAppData(...props, [stateRef.current, setState]),
    }),
    [],
  );

  const storeData = useMemo(
    () =>
      consolidatedLedger
        ? {
            ...consolidatedLedger,
            scheduledTxs: state.scheduledTxs,
            settings: state.settings,
            today,
          }
        : undefined,
    [consolidatedLedger, state.scheduledTxs, state.settings, today],
  );
  const appPreferences = useMemo(
    () => ({ language: state.settings?.language, theme: state.settings?.theme }),
    [state.settings?.language, state.settings?.theme],
  );
  const amountSettings = useMemo(
    () => ({ baseCurrency, maskAmount: state.settings?.maskAmount }),
    [baseCurrency, state.settings?.maskAmount],
  );

  if (bootError) throw bootError;
  if (!storeData) return null;

  return (
    <AppPreferencesContext.Provider value={appPreferences}>
      <AmountSettingsContext.Provider value={amountSettings}>
        <StoreActionsContext.Provider value={actions}>
          <StoreDataContext.Provider value={storeData}>{children}</StoreDataContext.Provider>
        </StoreActionsContext.Provider>
      </AmountSettingsContext.Provider>
    </AppPreferencesContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStoreData = () => useContext(StoreDataContext);
const useStoreActions = () => useContext(StoreActionsContext);
const useAppPreferences = () => useContext(AppPreferencesContext);
const useAmountSettings = () => useContext(AmountSettingsContext);
const useStore = () => {
  const data = useStoreData();
  const actions = useStoreActions();
  return useMemo(() => ({ ...data, ...actions }), [data, actions]);
};

export { StoreProvider, useAmountSettings, useAppPreferences, useStore, useStoreActions, useStoreData };
