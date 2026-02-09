import { NotificationsService } from '../../services';
import { DEFAULTS } from '../store.constants';

export const resetAppData = async ([state, setState]) => {
  // Best-effort: cancel Money-scoped notifications without prompting for permission.
  NotificationsService.clearAll?.().catch(() => {});

  // Reset persisted storage back to defaults.
  await state.store.wipe();

  // Reset in-memory state. Keep the existing store instance.
  setState({
    ...DEFAULTS,
    store: state.store,
  });
};
