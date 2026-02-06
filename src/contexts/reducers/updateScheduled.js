import { parseScheduled } from './modules';
import { NotificationsService } from '../../services';

export const updateScheduled = async ({ id, ...data } = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  store.get('scheduledTxs');
  const prev = await store.findOne({ id });
  if (!prev) return undefined;

  const next = parseScheduled({ ...prev, ...data, id: prev.id, createdAt: prev.createdAt });

  await store.update({ id }, next);
  const scheduledTxs = store.value;

  setState({ ...state, scheduledTxs });

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return next;
};
