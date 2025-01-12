import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { consolidate } from './modules';
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
import { DarkTheme, LightTheme } from '../theme';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      const { theme = 'light' } = await store.get('settings').value;
      StyleSheet.build(theme === 'light' ? LightTheme : DarkTheme);

      setState({
        store,
        accounts: await store.get('accounts')?.value,
        settings: await store.get('settings')?.value,
        subscription: await store.get('subscription')?.value,
        rates: await store.get('rates')?.value,
        txs: await store.get('txs')?.value,
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
        updateSubscription: (...props) => updateSubscription(...props, [state, setState]),
        updateRates: (...props) => updateRates(...props, [state, setState]),
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
