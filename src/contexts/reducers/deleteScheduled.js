import { NotificationsService } from '../../services';

export const deleteScheduled = async ({ id } = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  store.get('scheduledTxs');
  const removed = await store.remove({ id });
  const scheduledTxs = store.value;

  setState({ ...state, scheduledTxs });

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return removed;
};
