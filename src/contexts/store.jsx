import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { consolidate, migrateState } from './modules';
import { detectDeviceLanguage, setLanguage } from '../i18n';
import {
  buildAutoAccountCatalog,
  buildAutoAmountCatalog,
  buildAutoCategoryCatalog,
  C,
  eventEmitter,
  getOccurrencesBetween,
  L10N,
  learnAutoAccount,
  learnAutoAmount,
  learnAutoCategory,
  maybeUnlockPremiumFromAccounts,
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
  updateSubscription,
  updateRates,
  importBackup,
  resetAppData,
} from './reducers';
import { parseTx } from './reducers/modules';
import { DEFAULTS, FILENAME } from './store.constants';
import { NotificationsService, PurchaseService, ServiceRates, StorageService } from '../services';

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
  const existingIndex = txs.reduce((memo, tx) => {
    const meta = tx?.meta;
    if (meta?.kind !== 'scheduled') return memo;
    if (!meta?.scheduledId || !Number.isFinite(meta?.occurrenceAt)) return memo;
    memo[`${meta.scheduledId}:${meta.occurrenceAt}`] = true;
    return memo;
  }, {});

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
      if (existingIndex[key]) continue;
      existingIndex[key] = true;
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
      const nextAutoCategory =
        categoryTxs.length > 0
          ? categoryTxs.reduce((catalog, tx) => learnAutoCategory(catalog, tx), migrated.settings.autoCategory)
          : undefined;

      const accountTxs = newTxs.filter((tx) => !!tx?.account);
      const nextAutoAccount =
        accountTxs.length > 0
          ? accountTxs.reduce((catalog, tx) => learnAutoAccount(catalog, tx), migrated.settings.autoAccount)
          : undefined;

      const amountTxs = newTxs.filter((tx) => !!tx?.account && Number.isFinite(tx?.value) && tx.value > 0);
      const nextAutoAmount =
        amountTxs.length > 0
          ? amountTxs.reduce((catalog, tx) => learnAutoAmount(catalog, tx), migrated.settings.autoAmount)
          : undefined;

      if (nextAutoCategory || nextAutoAccount || nextAutoAmount) {
        nextSettings = {
          ...migrated.settings,
          ...(nextAutoCategory ? { autoCategory: nextAutoCategory } : null),
          ...(nextAutoAccount ? { autoAccount: nextAutoAccount } : null),
          ...(nextAutoAmount ? { autoAmount: nextAutoAmount } : null),
        };
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
  const ratesSyncInFlightRef = useRef(false);

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

      const prevSubscription = (await store.get('subscription')?.value) || {};
      const { shouldUnlock } = maybeUnlockPremiumFromAccounts({ accounts: migrated.accounts, subscription: prevSubscription });
      const nextSubscription = shouldUnlock
        ? { ...prevSubscription, productIdentifier: 'lifetime', unlockedBy: 'btc', unlockedAt: Date.now() }
        : prevSubscription;

      if (shouldUnlock) {
        await store.wipe('subscription');
        await store.get('subscription').save(nextSubscription);
      }

      setState({
        store,
        accounts: migrated.accounts,
        scheduledTxs: migrated.scheduledTxs,
        settings: migrated.settings,
        subscription: nextSubscription,
        rates: await store.get('rates')?.value,
        txs: migrated.txs,
      });

      if (shouldUnlock) {
        setTimeout(() => {
          eventEmitter.emit(C.EVENT.NOTIFICATION, {
            title: L10N.PREMIUM_UNLOCKED_TITLE,
            text: L10N.PREMIUM_UNLOCKED_CAPTION,
          });
          NotificationsService.notifyPremiumUnlocked?.().catch(() => {});
        }, 0);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.store) return undefined;

    let disposed = false;

    const syncSubscription = async ({ forceRefresh = false } = {}) => {
      const current = stateRef.current;
      if (!current?.store) return;

      try {
        const nextSubscription = await PurchaseService.syncSubscription({ forceRefresh });
        if (disposed) return;

        const latest = stateRef.current;
        if (!latest?.store) return;

        const currentProductIdentifier = latest.subscription?.productIdentifier;
        const nextProductIdentifier = nextSubscription?.productIdentifier;
        const currentIsBtcLifetime = currentProductIdentifier === 'lifetime' && latest.subscription?.unlockedBy === 'btc';
        const nextIsLifetime = nextProductIdentifier === 'lifetime';
        const currentHasCustomerInfo = !!latest.subscription?.customerInfo;
        const nextHasCustomerInfo = !!nextSubscription?.customerInfo;

        if (currentIsBtcLifetime && !nextIsLifetime) return;
        if (currentProductIdentifier === nextProductIdentifier) {
          if (nextHasCustomerInfo && !currentHasCustomerInfo) {
            await updateSubscription({ ...latest.subscription, ...nextSubscription }, [latest, setState]);
          }
          return;
        }

        await updateSubscription(nextSubscription, [latest, setState]);
      } catch (error) {
        // We keep last known local subscription when RevenueCat cannot be reached.
      }
    };

    const syncRates = async () => {
      const current = stateRef.current;
      if (!current?.store || ratesSyncInFlightRef.current) return;

      ratesSyncInFlightRef.current = true;
      try {
        const rates = await ServiceRates.get({
          baseCurrency: current?.settings?.baseCurrency,
          latest: true,
        }).catch(() => undefined);

        if (disposed || !rates) return;

        const latest = stateRef.current;
        if (!latest?.store) return;
        await updateRates(rates, [latest, setState]);
      } finally {
        ratesSyncInFlightRef.current = false;
      }
    };

    syncSubscription({ forceRefresh: true });
    syncRates();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
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
        await syncRates();
        await syncSubscription({ forceRefresh: true });
      })();
    });

    return () => {
      disposed = true;
      appStateSubscription.remove();
    };
  }, [state.store]);

  const consolidated = useMemo(() => consolidate(state), [state]);

  return (
    <StoreContext.Provider
      value={{
        ...consolidated,
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
