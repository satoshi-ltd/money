export const updateRates = async (rates, baseCurrency, [state, setState]) => {
  baseCurrency = state.settings.baseCurrency;
  const nextRates = { ...state.rates, ...rates };
  const nextSettings = { ...state.settings, baseCurrency, lastRatesUpdate: new Date() };
  const accounts = await state.store.get('accounts').value;

  await state.store.get('rates').save(nextRates);
  await state.store.get('settings').save(nextSettings);

  setState({ ...state, accounts, rates: nextRates, settings: nextSettings });
};
