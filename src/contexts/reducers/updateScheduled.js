import { parseScheduled } from './modules';
import { NotificationsService } from '../../services';

export const updateScheduled = async ({ id, ...data } = {}, [state, setState]) => {
  const { store, txs = [] } = state;

  store.get('scheduledTxs');
  const prev = await store.findOne({ id });
  if (!prev) return undefined;

  const candidate = parseScheduled({ ...prev, ...data, id: prev.id, createdAt: prev.createdAt });
  const recurrenceChanged =
    candidate.startAt !== prev.startAt || JSON.stringify(candidate.pattern) !== JSON.stringify(prev.pattern);
  const next = recurrenceChanged ? { ...candidate, materialiseFrom: Date.now() } : candidate;

  await store.update({ id }, next);
  const scheduledTxs = store.value;

  setState((prev) => ({ ...prev, scheduledTxs }));

  await NotificationsService.syncScheduled({ scheduledTxs, txs });

  return next;
};
