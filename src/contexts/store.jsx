import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

import { consolidate, migrateState } from './modules';
import { detectDeviceLanguage, setLanguage } from '../i18n';
import { buildAutoCategoryCatalog } from '../modules';
import {
  // -- account
  createAccount,
  updateAccount,
  deleteAccount,
  // -- tx
  createTx,
  updateTx,
  deleteTx,
  // -- settings
  updateSettings,
  updateSubscription,
  updateRates,
  importBackup,
} from './reducers';
import { DEFAULTS, FILENAME } from './store.constants';
import { StorageService } from '../services';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      const rawState = {
        accounts: await store.get('accounts')?.value,
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

      if (migrated.settings.schemaVersion !== rawState?.settings?.schemaVersion) {
        await store.get('settings').save(migrated.settings);
      }

      setState({
        store,
        accounts: migrated.accounts,
        settings: migrated.settings,
        subscription: await store.get('subscription')?.value,
        rates: await store.get('rates')?.value,
        txs: migrated.txs,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
