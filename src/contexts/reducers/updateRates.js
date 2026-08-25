import { saveSettings } from './modules';

export const updateRates = async ({ currency, ...rates } = {}, [state, setState], { downloaded = true } = {}) => {
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
    // Only a real download moves this: it is what Settings reads back as the last update.
    ...(downloaded ? { lastRatesUpdate: new Date() } : {}),
    ratesBaseCurrency: nextBaseCurrency,
  });

  setState((prev) => ({ ...prev, accounts, rates: nextRates, settings: nextSettings }));
};
