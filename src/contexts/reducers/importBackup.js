import { migrateState } from '../modules';
import { updateSubscription } from './updateSubscription';
import { NotificationsService } from '../../services';
import { C, eventEmitter, L10N, maybeUnlockPremiumFromAccounts } from '../../modules';
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

  const prevSubscription = (await store.get('subscription')?.value) || {};
  const { shouldUnlock } = maybeUnlockPremiumFromAccounts({ accounts: migrated.accounts, subscription: prevSubscription });
  const nextSubscription = shouldUnlock
    ? { ...prevSubscription, productIdentifier: 'lifetime', unlockedBy: 'btc', unlockedAt: Date.now() }
    : prevSubscription;

  await store.replace({
    accounts: migrated.accounts,
    scheduledTxs: migrated.scheduledTxs,
    settings: migrated.settings,
    txs: migrated.txs,
    ...(keepRates ? null : { rates: {} }),
  });

  if (shouldUnlock) await updateSubscription(nextSubscription, [state, setState]);

  setState((prev) => ({
    ...prev,
    settings: migrated.settings,
    accounts: migrated.accounts,
    rates: keepRates ? prev.rates : {},
    scheduledTxs: migrated.scheduledTxs,
    txs: migrated.txs,
    subscription: shouldUnlock ? nextSubscription : prev.subscription,
  }));

  if (shouldUnlock) {
    eventEmitter.emit(C.EVENT.NOTIFICATION, { title: L10N.PREMIUM_UNLOCKED_TITLE, text: L10N.PREMIUM_UNLOCKED_CAPTION });
    NotificationsService.notifyPremiumUnlocked?.().catch(() => {});
  }
};
