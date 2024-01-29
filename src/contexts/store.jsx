import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { consolidate, parseTx, parseVault } from './modules';
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
        settings: await store.get('settings')?.value,
        subscription: await store.get('subscription')?.value,
        rates: await store.get('rates')?.value,
        vaults: await store.get('accounts')?.value,
        txs: await store.get('txs')?.value,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTx = async (data = {}) => {
    const { store } = state;

    store.get('txs');
    const tx = await store.save(parseTx(data));
    setState({ ...state, txs: await store.get('txs').value });

    return tx;
  };

  const addVault = async (data = {}) => {
    const { store } = state;
    const vault = await store.get('accounts').save(parseVault(data));
    if (vault) setState({ ...state, vaults: await store.get('accounts').value });

    return vault;
  };

  const deleteTx = async ({ hash }) => {
    const { store } = state;

    await store.get('txs').remove({ hash });
    setState({ ...state, txs: await store.get('txs').value });
  };

  // ! TODO: Should be in an standalone service
  const importBackup = async ({ accounts = [], settings = {}, txs = [] } = {}) => {
    const { store } = state;

    await store.wipe('accounts');
    await store.wipe('settings');
    await store.wipe('txs');
    await store.get('accounts').save(accounts);
    await store.get('settings').save(settings);
    await store.get('txs').save(txs);

    setState({
      ...state,
      settings,
      vaults: accounts,
      txs,
    });
  };

  const updateRates = async (rates, baseCurrency = state.settings.baseCurrency) => {
    const nextRates = { ...state.rates, ...rates };
    const nextSettings = { ...state.settings, baseCurrency, lastRatesUpdate: new Date() };
    const vaults = await state.store.get('accounts').value;

    await state.store.get('rates').save(nextRates);
    await state.store.get('settings').save(nextSettings);

    setState({ ...state, vaults, rates: nextRates, settings: nextSettings });
  };

  const updateSettings = async (value) => {
    const nextSettings = { ...state.settings, ...value };
    await state.store.get('settings').save(nextSettings);

    setState({ ...state, settings: nextSettings });
  };

  const updateSubscription = async (subscription) => {
    await state.store.get('subscription').save(subscription);

    setState({ ...state, subscription });
  };

  const updateTx = async ({ hash, ...data } = {}) => {
    const { store } = state;
    const tx = await store.get('txs').findOne({ hash });
    if (!tx) return undefined;

    await store.update({ hash }, parseTx({ ...tx, ...data }));
    setState({ ...state, txs: await store.value });

    return await store.findOne({ hash });
  };

  const updateVault = async ({ hash, ...data } = {}) => {
    const { store } = state;
    store.get('accounts');

    const vault = await store.findOne({ hash });
    if (!vault) return undefined;

    await store.update({ hash }, parseVault({ ...vault, ...data }));
    setState({ ...state, vaults: await store.value });

    return await store.findOne({ hash });
  };

  return (
    <StoreContext.Provider
      value={{
        ...consolidate(state),
        addTx,
        addVault,
        deleteTx,
        importBackup,
        updateRates,
        updateSettings,
        updateSubscription,
        updateTx,
        updateVault,
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
