export const updateRates = async ({ currency, ...rates } = {}, [state, setState]) => {
  const { settings: { baseCurrency } = {} } = state;

  const nextRates = { ...state.rates, ...rates };
  const nextSettings = { ...state.settings, baseCurrency: currency || baseCurrency, lastRatesUpdate: new Date() };
  const accounts = await state.store.get('accounts').value;

  await state.store.get('rates').save(nextRates);
  await state.store.get('settings').save(nextSettings);

  setState({ ...state, accounts, rates: nextRates, settings: nextSettings });
};
