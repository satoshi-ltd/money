import { parseScheduled } from './modules';
import { NotificationsService } from '../../services';

export const createScheduled = async (data = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  store.get('scheduledTxs');
  const scheduled = await store.save(parseScheduled(data));
  const scheduledTxs = store.value;

  setState({ ...state, scheduledTxs });

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return scheduled;
};
