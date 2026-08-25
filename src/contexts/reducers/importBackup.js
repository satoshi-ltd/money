import { migrateState } from '../modules';
import { ratesOrSeed } from '../../services';
export const importBackup = async (
  { accounts = [], scheduledTxs = [], schemaVersion, settings = {}, txs = [] } = {},
  [state, setState],
) => {
  const { store } = state;

  const migrated = migrateState({ accounts, scheduledTxs, schemaVersion, settings, txs });
  const cachedBaseCurrency = state.settings?.ratesBaseCurrency || state.settings?.baseCurrency;
  const keepRates = cachedBaseCurrency === migrated.settings.baseCurrency;
  migrated.settings.ratesBaseCurrency = keepRates ? cachedBaseCurrency : undefined;
  migrated.settings.pin = state.settings?.pin;

  const nextRates = ratesOrSeed(keepRates ? state.rates : undefined, migrated.settings.baseCurrency);

  await store.replace({
    accounts: migrated.accounts,
    rates: nextRates,
    scheduledTxs: migrated.scheduledTxs,
    settings: migrated.settings,
    txs: migrated.txs,
  });

  setState((prev) => ({
    ...prev,
    settings: migrated.settings,
    accounts: migrated.accounts,
    rates: nextRates,
    scheduledTxs: migrated.scheduledTxs,
    txs: migrated.txs,
  }));
};
