import { migrateState } from '../modules';
import { NotificationsService, ratesOrSeed } from '../../services';
import { validateBackupPayload } from '../../services/modules/backupValidation';
export const importBackup = async (
  { accounts = [], scheduledTxs = [], schemaVersion, settings = {}, txs = [] } = {},
  [state, setState],
) => {
  const { store } = state;

  const checked = validateBackupPayload({ accounts, scheduledTxs, schemaVersion, settings, txs });
  if (!checked.ok) throw new Error('invalid_backup');

  const migrated = migrateState({ accounts, scheduledTxs: checked.value.scheduledTxs, schemaVersion, settings, txs });
  const cachedBaseCurrency = state.settings?.ratesBaseCurrency || state.settings?.baseCurrency;
  const keepRates = cachedBaseCurrency === migrated.settings.baseCurrency;
  migrated.settings.ratesBaseCurrency = keepRates ? cachedBaseCurrency : undefined;
  migrated.settings.pin = state.settings?.pin;
  // The PIN never leaves this phone, so neither does the fingerprint that stands in for it.
  migrated.settings.biometricUnlockEnabled = state.settings?.biometricUnlockEnabled;

  const { rates: nextRates, seeded } = ratesOrSeed(
    keepRates ? state.rates : undefined,
    migrated.settings.baseCurrency,
    keepRates ? state.settings?.lastRatesUpdate : undefined,
  );
  // The backup carries the exporting device's timestamp but never its rates: do not let it vouch for the seed.
  if (seeded) migrated.settings.lastRatesUpdate = undefined;

  await store.replace({
    accounts: migrated.accounts,
    rates: nextRates,
    scheduledTxs: migrated.scheduledTxs,
    settings: migrated.settings,
    txs: migrated.txs,
  });

  NotificationsService.setHour(migrated.settings.reminderHour);
  NotificationsService.reminders(migrated.settings.reminders);
  NotificationsService.syncScheduled({ scheduledTxs: migrated.scheduledTxs, txs: migrated.txs });

  setState((prev) => ({
    ...prev,
    settings: migrated.settings,
    accounts: migrated.accounts,
    rates: nextRates,
    scheduledTxs: migrated.scheduledTxs,
    txs: migrated.txs,
  }));
};
