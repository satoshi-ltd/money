import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { consolidate, migrateState } from './modules';
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
import { ratesOrSeed, rebaseRates, ServiceRates, StorageService } from '../services';

const RATES_SYNC_INTERVAL = 6 * 60 * 60 * 1000;

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);
  const [bootError, setBootError] = useState();
  const today = useToday();
  const stateRef = useRef(state);
  const ratesSyncInFlightRef = useRef(false);
  const syncRatesRef = useRef();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      const rawState = {
        accounts: await store.get('accounts')?.value,
        scheduledTxs: await store.get('scheduledTxs')?.value,
        settings: await store.get('settings')?.value,
        txs: await store.get('txs')?.value,
      };
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

      migrated = await runScheduledSync({ migrated, store });

      if (migrated.settings.schemaVersion !== rawState?.settings?.schemaVersion) {
        await store.get('settings').save(migrated.settings);
      }

      const rates = ratesOrSeed(await store.get('rates')?.value, migrated.settings?.baseCurrency);

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

    const syncRates = async () => {
      const current = stateRef.current;
      if (!current?.store || ratesSyncInFlightRef.current) return;

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
        });
        setState((prev) => ({
          ...prev,
          settings: nextMigrated.settings,
          txs: nextMigrated.txs,
        }));
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
    const { baseCurrency, ratesBaseCurrency } = state.settings || {};
    if (!state.store || !baseCurrency || ratesBaseCurrency === baseCurrency) return;

    // Cross rates are exact: convert the cache in place so the new base works offline and downloads nothing.
    updateRates(rebaseRates(state.rates, baseCurrency), [state, setState], { downloaded: false }).then(() =>
      syncRatesRef.current?.(),
    );
  }, [state.store, state.settings]);

  const consolidated = useMemo(() => consolidate({ ...state, now: today }), [state, today]);

  if (bootError) throw bootError;

  return (
    <StoreContext.Provider
      value={{
        ...consolidated,
        today,
        // -- account
        createAccount: (...props) => createAccount(...props, [state, setState]),
        updateAccount: (...props) => updateAccount(...props, [state, setState]),
        deleteAccount: (...props) => deleteAccount(...props, [state, setState]),
        // -- tx
        createTx: (...props) => createTx(...props, [state, setState]),
        updateTx: (...props) => updateTx(...props, [state, setState]),
        deleteTx: (...props) => deleteTx(...props, [state, setState]),
        // -- scheduledTxs
        createScheduled: (...props) => createScheduled(...props, [state, setState]),
        updateScheduled: (...props) => updateScheduled(...props, [state, setState]),
        deleteScheduled: (...props) => deleteScheduled(...props, [state, setState]),
        // -- settings
        updateSettings: (...props) => updateSettings(...props, [state, setState]),
        updateRates: (...props) => updateRates(...props, [state, setState]),
        updateTheme: (theme) => updateSettings({ theme }, [state, setState]),
        importBackup: (...props) => importBackup(...props, [state, setState]),
        resetAppData: (...props) => resetAppData(...props, [state, setState]),
      }}
    >
      {state.store ? children : undefined}
    </StoreContext.Provider>
  );
};

StoreProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useStore = () => useContext(StoreContext);

export { StoreProvider, useStore };
