import { NotificationsService } from '../../services';

export const deleteAccount = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('accounts');
  const account = await store.findOne({ hash });
  if (!account) return undefined;

  await store.remove({ hash });
  await store.get('txs').remove({ account: hash });
  await store.get('scheduledTxs').remove({ account: hash });

  const scheduledTxs = await store.get('scheduledTxs').value;
  const txs = await store.get('txs').value;

  const accounts = await store.get('accounts').value;

  setState((prev) => ({ ...prev, accounts, scheduledTxs, txs }));

  await NotificationsService.syncScheduled({ scheduledTxs, txs });
};
