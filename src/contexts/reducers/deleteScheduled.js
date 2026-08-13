import { NotificationsService } from '../../services';

export const deleteScheduled = async ({ id } = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  const collection = store.get('scheduledTxs');
  const removed = await collection.remove({ id });
  const scheduledTxs = collection.value;

  setState((prev) => ({ ...prev, scheduledTxs }));

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return removed;
};
