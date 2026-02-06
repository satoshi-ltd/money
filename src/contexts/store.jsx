import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { consolidate, migrateState } from './modules';
import { detectDeviceLanguage, setLanguage } from '../i18n';
import { buildAutoCategoryCatalog, C, eventEmitter, getOccurrencesBetween, L10N, learnAutoCategory } from '../modules';
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
  updateSubscription,
  updateRates,
  importBackup,
} from './reducers';
import { parseTx } from './reducers/modules';
import { DEFAULTS, FILENAME } from './store.constants';
import { NotificationsService, StorageService } from '../services';

const { EVENT } = C;
const MS_IN_DAY = C.MS_IN_DAY;
const MAX_SCHEDULED_AUTOCREATE = 100;

const StoreContext = createContext(`context:store`);

const runScheduledSync = async ({ migrated, store }) => {
  const scheduledTxs = Array.isArray(migrated?.scheduledTxs) ? migrated.scheduledTxs : [];
  const txs = Array.isArray(migrated?.txs) ? migrated.txs : [];

  if (scheduledTxs.length === 0) {
    await NotificationsService.syncScheduled({ scheduledTxs, txs });
    return migrated;
  }

  const now = Date.now();
  const fromAt = now - 90 * MS_IN_DAY;
  const toAt = now;
  const existingIndex = new Set(
    txs
      .map((tx) => {
        const meta = tx?.meta;
        if (meta?.kind !== 'scheduled') return null;
        if (!meta?.scheduledId || !Number.isFinite(meta?.occurrenceAt)) return null;
        return `${meta.scheduledId}:${meta.occurrenceAt}`;
      })
      .filter(Boolean),
  );

  const newTxs = [];
  let hitLimit = false;
  for (let i = 0; i < scheduledTxs.length; i += 1) {
    const scheduled = scheduledTxs[i];
    const occurrences = getOccurrencesBetween({ scheduled, fromAt, toAt });
    for (let j = 0; j < occurrences.length; j += 1) {
      if (newTxs.length >= MAX_SCHEDULED_AUTOCREATE) {
        hitLimit = true;
        break;
      }
      const occurrenceAt = occurrences[j];
      const key = `${scheduled.id}:${occurrenceAt}`;
      if (existingIndex.has(key)) continue;
      existingIndex.add(key);
      newTxs.push(
        parseTx({
          account: scheduled.account,
          category: scheduled.category,
          title: scheduled.title,
          timestamp: occurrenceAt,
          type: scheduled.type,
          value: scheduled.value,
          meta: { kind: 'scheduled', scheduledId: scheduled.id, occurrenceAt },
        }),
      );
    }
    if (newTxs.length >= MAX_SCHEDULED_AUTOCREATE) {
      if (i < scheduledTxs.length - 1) hitLimit = true;
      break;
    }
  }

  let next = migrated;
  if (newTxs.length > 0) {
    store.get('txs');
    await store.save(newTxs);
    const nextTxs = store.value;

    let nextSettings = migrated.settings;
    const categoryTxs = newTxs.filter((tx) => tx?.category !== undefined);
    if (categoryTxs.length > 0) {
      const nextCatalog = categoryTxs.reduce((catalog, tx) => learnAutoCategory(catalog, tx), migrated.settings.autoCategory);
      nextSettings = { ...migrated.settings, autoCategory: nextCatalog };
      await store.get('settings').save(nextSettings);
    }

    next = { ...migrated, txs: nextTxs, settings: nextSettings };
  }

  await NotificationsService.syncScheduled({ scheduledTxs: next.scheduledTxs, txs: next.txs });

  if (hitLimit) {
    eventEmitter.emit(EVENT.NOTIFICATION, {
      title: L10N.SCHEDULED,
      text: L10N.SCHEDULED_AUTOCREATE_LIMIT,
    });
  }

  return next;
};

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);
  const stateRef = useRef(state);

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
      const hasRules = Object.keys(autoCategory.rules || {}).length > 0;
      if (!hasRules && (migrated.txs || []).length > 0) {
        const catalog = buildAutoCategoryCatalog(migrated.txs);
        const nextSettings = {
          ...migrated.settings,
          autoCategory: {
            ...autoCategory,
            ...catalog,
          },
        };
        await store.get('settings').save(nextSettings);
        migrated = { ...migrated, settings: nextSettings };
      }

      migrated = await runScheduledSync({ migrated, store });

      if (migrated.settings.schemaVersion !== rawState?.settings?.schemaVersion) {
        await store.get('settings').save(migrated.settings);
      }

      setState({
        store,
        accounts: migrated.accounts,
        scheduledTxs: migrated.scheduledTxs,
        settings: migrated.settings,
        subscription: await store.get('subscription')?.value,
        rates: await store.get('rates')?.value,
        txs: migrated.txs,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.store) return undefined;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;

      const current = stateRef.current;
      if (!current?.store) return;

      (async () => {
        const nextMigrated = await runScheduledSync({
          migrated: {
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
      })();
    });

    return () => subscription.remove();
  }, [state.store]);

  return (
    <StoreContext.Provider
      value={{
        ...consolidate(state),
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
        updateSubscription: (...props) => updateSubscription(...props, [state, setState]),
        updateTheme: (theme) => updateSettings({ theme }, [state, setState]),
        importBackup: (...props) => importBackup(...props, [state, setState]),
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
