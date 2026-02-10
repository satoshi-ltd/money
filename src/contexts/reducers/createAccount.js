import { parseAccount } from './modules';
import { updateSubscription } from './updateSubscription';
import { NotificationsService } from '../../services';
import { C, eventEmitter, L10N, maybeUnlockPremiumFromAccounts } from '../../modules';

export const createAccount = async (data = {}, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.save(parseAccount(data));
  const accounts = await store.value;
  setState((prev) => ({ ...prev, accounts }));

  const { shouldUnlock } = maybeUnlockPremiumFromAccounts({ accounts, subscription: state.subscription });
  if (shouldUnlock && account?.currency === 'BTC') {
    const prevSubscription = state.subscription || {};
    const nextSubscription = {
      ...prevSubscription,
      productIdentifier: 'lifetime',
      unlockedBy: 'btc',
      unlockedAt: Date.now(),
    };

    await updateSubscription(nextSubscription, [state, setState]);
    eventEmitter.emit(C.EVENT.NOTIFICATION, { title: L10N.PREMIUM_UNLOCKED_TITLE, text: L10N.PREMIUM_UNLOCKED_CAPTION });
    NotificationsService.notifyPremiumUnlocked?.().catch(() => {});
  }

  return account;
};
