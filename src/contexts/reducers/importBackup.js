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
  const prevSubscription = (await store.get('subscription')?.value) || {};
  const { shouldUnlock } = maybeUnlockPremiumFromAccounts({ accounts: migrated.accounts, subscription: prevSubscription });
  const nextSubscription = shouldUnlock
    ? { ...prevSubscription, productIdentifier: 'lifetime', unlockedBy: 'btc', unlockedAt: Date.now() }
    : prevSubscription;

  await store.wipe('accounts');
  await store.wipe('scheduledTxs');
  await store.wipe('settings');
  await store.wipe('txs');
  await store.get('accounts').save(migrated.accounts);
  await store.get('scheduledTxs').save(migrated.scheduledTxs);
  await store.get('settings').save(migrated.settings);
  await store.get('txs').save(migrated.txs);

  if (shouldUnlock) await updateSubscription(nextSubscription, [state, setState]);

  setState((prev) => ({
    ...prev,
    settings: migrated.settings,
    accounts: migrated.accounts,
    scheduledTxs: migrated.scheduledTxs,
    txs: migrated.txs,
    subscription: shouldUnlock ? nextSubscription : prev.subscription,
  }));

  if (shouldUnlock) {
    eventEmitter.emit(C.EVENT.NOTIFICATION, { title: L10N.PREMIUM_UNLOCKED_TITLE, text: L10N.PREMIUM_UNLOCKED_CAPTION });
    NotificationsService.notifyPremiumUnlocked?.().catch(() => {});
  }
};
