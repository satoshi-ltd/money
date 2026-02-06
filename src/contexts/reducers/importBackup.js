import { migrateState } from '../modules';
export const importBackup = async (
  { accounts = [], scheduledTxs = [], schemaVersion, settings = {}, txs = [] } = {},
  [state, setState],
) => {
  const { store } = state;

  const migrated = migrateState({ accounts, scheduledTxs, schemaVersion, settings, txs });

  await store.wipe('accounts');
  await store.wipe('scheduledTxs');
  await store.wipe('settings');
  await store.wipe('txs');
  await store.get('accounts').save(migrated.accounts);
  await store.get('scheduledTxs').save(migrated.scheduledTxs);
  await store.get('settings').save(migrated.settings);
  await store.get('txs').save(migrated.txs);

  setState({
    ...state,
    settings: migrated.settings,
    accounts: migrated.accounts,
    scheduledTxs: migrated.scheduledTxs,
    txs: migrated.txs,
  });
};
