import { migrateState } from '../modules';
export const importBackup = async (
  { accounts = [], schemaVersion, settings = {}, txs = [] } = {},
  [state, setState],
) => {
  const { store } = state;

  const migrated = migrateState({ accounts, schemaVersion, settings, txs });

  await store.wipe('accounts');
  await store.wipe('settings');
  await store.wipe('txs');
  await store.get('accounts').save(migrated.accounts);
  await store.get('settings').save(migrated.settings);
  await store.get('txs').save(migrated.txs);

  setState({
    ...state,
    settings: migrated.settings,
    accounts: migrated.accounts,
    txs: migrated.txs,
  });
};
