import { parseScheduled } from './modules';
import { NotificationsService } from '../../services';

export const createScheduled = async (data = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  const collection = store.get('scheduledTxs');
  const scheduled = await collection.save(parseScheduled(data));
  const scheduledTxs = collection.value;

  setState((prev) => ({ ...prev, scheduledTxs }));

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return scheduled;
};
