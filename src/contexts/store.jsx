import PropTypes from 'prop-types';
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

import { consolidate, parseTx, parseVault } from './modules';
import { DEFAULTS, FILENAME } from './store.constants';
import { StorageService } from '../services';

const StoreContext = createContext(`context:store`);

const StoreProvider = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  useLayoutEffect(() => {
    (async () => {
      const store = await new StorageService({ defaults: DEFAULTS, filename: FILENAME });

      setState({
        store,
        settings: await store.get('settings')?.value,
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

  const updateRates = async (rates, baseCurrency = state.settings.baseCurrency) => {
    const nextRates = { ...state.rates, ...rates };
    const nextSettings = { ...state.settings, baseCurrency, lastRatesUpdate: new Date() };
    await state.store.get('rates').save(nextRates);
    await state.store.get('settings').save(nextSettings);

    setState({ ...state, rates: nextRates, settings: nextSettings });
  };

  const updateSettings = async (value) => {
    const nextSettings = { ...state.settings, ...value };
    await state.store.get('settings').save(nextSettings);

    setState({ ...state, settings: nextSettings });
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
        updateRates,
        updateSettings,
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
