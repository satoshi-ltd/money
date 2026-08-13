export const updateRates = async ({ currency, ...rates } = {}, [state, setState]) => {
  const { settings: { baseCurrency, ratesBaseCurrency } = {} } = state;

  const nextBaseCurrency = currency || baseCurrency;
  const cachedBaseCurrency = ratesBaseCurrency || baseCurrency;
  const keepCache = cachedBaseCurrency === nextBaseCurrency;

  const nextRates = keepCache ? { ...state.rates, ...rates } : { ...rates };
  const nextSettings = {
    ...state.settings,
    baseCurrency: nextBaseCurrency,
    lastRatesUpdate: new Date(),
    ratesBaseCurrency: nextBaseCurrency,
  };
  const accounts = await state.store.get('accounts').value;

  if (!keepCache) await state.store.wipe('rates');
  await state.store.get('rates').save(nextRates);
  await state.store.get('settings').save(nextSettings);

  setState({ ...state, accounts, rates: nextRates, settings: nextSettings });
};
