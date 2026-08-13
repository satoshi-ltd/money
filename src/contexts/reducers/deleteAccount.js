import { NotificationsService } from '../../services';

export const deleteAccount = async ({ hash }, [state, setState]) => {
  const { store } = state;

  const accountsCollection = store.get('accounts');
  const account = accountsCollection.findOne({ hash });
  if (!account) return undefined;

  await accountsCollection.remove({ hash });
  await store.get('txs').remove({ account: hash });
  await store.get('scheduledTxs').remove({ account: hash });

  const scheduledTxs = store.get('scheduledTxs').value;
  const txs = store.get('txs').value;

  const accounts = accountsCollection.value;

  setState((prev) => ({ ...prev, accounts, scheduledTxs, txs }));

  await NotificationsService.syncScheduled({ scheduledTxs, txs });
};
