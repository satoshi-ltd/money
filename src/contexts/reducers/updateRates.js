import { saveSettings } from './modules';

export const updateRates = async ({ currency, ...rates } = {}, [state, setState]) => {
  const { settings: { baseCurrency, ratesBaseCurrency } = {} } = state;

  if (!Object.keys(rates).length) return;

  const nextBaseCurrency = currency || baseCurrency;
  const cachedBaseCurrency = ratesBaseCurrency || baseCurrency;
  const keepCache = cachedBaseCurrency === nextBaseCurrency;

  const nextRates = keepCache ? { ...state.rates, ...rates } : { ...rates };
  const accounts = await state.store.get('accounts').value;

  if (!keepCache) await state.store.wipe('rates');
  await state.store.get('rates').save(nextRates);

  const nextSettings = await saveSettings(state.store, {
    baseCurrency: nextBaseCurrency,
    lastRatesUpdate: new Date(),
    ratesBaseCurrency: nextBaseCurrency,
  });

  setState((prev) => ({ ...prev, accounts, rates: nextRates, settings: nextSettings }));
};
